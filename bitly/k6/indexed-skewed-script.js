import http from 'k6/http';
import { Counter, Rate } from 'k6/metrics';

// ====================================================================================
// ★ 설정 영역 ★
// (이 부분의 값을 조절하여 테스트 강도를 설정합니다)
// ====================================================================================
const TIME_THRESHOLD = 200; // 성공/실패 기준 시간 (ms)
const SUCCESS_RATE_THRESHOLD = 0.98; // 성공률 목표 (98%)

// --- 인기 URL 시뮬레이션 설정 ---
const TOTAL_URLS = 10000000; // DB에 저장된 총 URL 개수 (1000만)
const HOT_SET_PERCENTAGE = 0.05; // 인기 URL 그룹의 비율 (상위 5%)
const HOT_SET_REQUEST_PERCENTAGE = 0.80; // 인기 URL 그룹에 보낼 요청의 비율 (80%)
// ====================================================================================

// --- 내부 계산 변수 (수정 필요 없음) ---
const hotSetSize = Math.floor(TOTAL_URLS * HOT_SET_PERCENTAGE);
const coldSetSize = TOTAL_URLS - hotSetSize;

// Base62 인코딩 함수 (서버 로직과 동일하게 유지)
const BASE62_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function base62_encode(value) {
  if (value === 0) return 'A';
  let result = '';
  while (value > 0) {
    result = BASE62_CHARS.charAt(value % 62) + result;
    value = Math.floor(value / 62);
  }
  return result;
}

// 메트릭 정의
const successful_req_count = new Counter('successful_requests_count');
const failed_req_count = new Counter('failed_by_time_requests_count');
const success_rate = new Rate('success_rate');

export const options = {
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 5000,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 100,
      maxVUs: 100000,
    },
  },
  thresholds: {
    'success_rate': [`rate>${SUCCESS_RATE_THRESHOLD}`],
    'http_req_failed': ['rate<0.01'],
  },
};

// 메인 테스트 함수
export default function () {
  let valueToEncode;

  // 80% 확률로 Hot Set, 20% 확률로 Cold Set에서 URL 선택
  if (Math.random() < HOT_SET_REQUEST_PERCENTAGE) {
    // 인기 URL(Hot Set)에서 ID 선택 (1 ~ 500,000)
    valueToEncode = Math.floor(Math.random() * hotSetSize) + 1;
  } else {
    // 일반 URL(Cold Set)에서 ID 선택 (500,001 ~ 10,000,000)
    valueToEncode = hotSetSize + Math.floor(Math.random() * coldSetSize) + 1;
  }

  const shortUrl = base62_encode(valueToEncode);
  const res = http.get(`http://localhost:8080/index/${shortUrl}`, {
    redirects: 0,
    tags: {
      name: '/index/{shortUrl}',
    },
  });

  const isNetworkSuccess = res.status !== 0;
  const isTimeSuccess = isNetworkSuccess && (res.timings.duration < TIME_THRESHOLD);

  success_rate.add(isTimeSuccess);

  if (isTimeSuccess) {
    successful_req_count.add(1);
  } else {
    failed_req_count.add(1);
  }
}
