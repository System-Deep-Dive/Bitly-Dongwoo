import http from 'k6/http';

import { Counter, Rate } from 'k6/metrics';

// ====================================================================================
// ★ 설정 영역 ★
// (이 부분의 값을 조절하여 테스트 강도를 설정합니다)
// ====================================================================================
const TIME_THRESHOLD = 200; // 성공/실패 기준 시간 (ms)
const SUCCESS_RATE_THRESHOLD = 0.98; // 성공률 목표 (98%)
const TOTAL_URLS = 1000000; // DB에 저장된 총 URL 개수
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

// 실행기를 'constant-arrival-rate'로 변경합니다.
      executor: 'constant-arrival-rate',
// 1초(timeUnit)마다 100번(rate)의 요청을 시작합니다. (초당 100 TPS)
      rate: 5000,
      timeUnit: '1s',
// 10분 동안 이 속도를 유지합니다.
      duration: '5m',
// k6가 목표 속도를 맞추기 위해 미리 준비해 둘 VU의 수입니다.
// rate 값과 비슷하거나 약간 높게 설정하는 것이 일반적입니다.
      preAllocatedVUs: 100,
// 만약 preAllocatedVUs로 부족할 경우, k6가 추가로 생성할 수 있는 VU의 최대치입니다.
      maxVUs: 100000,
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
  const res = http.get(`http://localhost:8080/index/${shortUrl}`, {
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
