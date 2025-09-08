import http from 'k6/http';
import { Counter, Rate } from 'k6/metrics';

// ====================================================================================
//                                  ★ 설정 영역 ★
//         (이 부분의 값을 조절하여 테스트 강도를 설정합니다)
// ====================================================================================
const VUS_PEAK = 1000; // 테스트 시간 동안 유지할 가상 유저(VU) 수
const PEAK_DURATION = '10m'; // 부하를 유지할 시간
const TIME_THRESHOLD = 200; // 성공/실패 기준 시간 (ms)
const SUCCESS_RATE_THRESHOLD = 0.98; // 성공률 목표 (98%)
const TOTAL_URLS = 5000000; // DB에 저장된 총 URL 개수
// ====================================================================================

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

// 메트릭 정의: 개수 카운터 (최종 결과 표시용)
const successful_req_count = new Counter('successful_requests_count');
const failed_req_count = new Counter('failed_by_time_requests_count');

// 메트릭 정의: 성공률 계산기 (Threshold 판정용)
const success_rate = new Rate('success_rate');

export const options = {
  scenarios: {
    contacts: {
      // 실행기를 'constant-vus'로 설정
      executor: 'constant-vus',

      // VUS_PEAK에 설정된 가상 유저 수를 테스트 내내 유지
      vus: VUS_PEAK,

      // PEAK_DURATION에 설정된 시간 동안 테스트를 실행
      duration: PEAK_DURATION,
    },
  },
  thresholds: {
    // "전체 요청 중 성공률이 98% 이상이어야 한다."
    'success_rate': [`rate>${SUCCESS_RATE_THRESHOLD}`],
    // "네트워크 오류 등 HTTP 요청 실패율은 1% 미만이어야 한다."
    'http_req_failed': ['rate<0.01'],
  },
};

// 메인 테스트 함수: 각 가상 유저가 duration 동안 반복 실행
export default function () {
  // 500만개 범위 내에서 랜덤 ID를 실시간으로 인코딩하여 요청
  const valueToEncode = Math.floor(Math.random() * TOTAL_URLS) + 1;
  const shortUrl = base62_encode(valueToEncode);
  const res = http.get(`http://localhost:8080/${shortUrl}`, {
    redirects: 0,
    tags: {
      name: '/{shortUrl}', // 모든 요청을 하나의 대표 이름으로 그룹화
    },
  });

  // 네트워크 자체에 실패가 없었는지 확인 (e.g., connection reset)
  const isNetworkSuccess = res.status !== 0;
  // 네트워크 성공 시에만 시간 기준으로 성공 여부 판별
  const isTimeSuccess = isNetworkSuccess && (res.timings.duration < TIME_THRESHOLD);

  // 최종 성공 여부를 success_rate에 기록 (네트워크 실패도 '실패'로 간주)
  success_rate.add(isTimeSuccess);

  // 개수 카운터 기록
  if (isTimeSuccess) {
    successful_req_count.add(1);
  } else {
    failed_req_count.add(1);
  }
}
