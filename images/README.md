# 이미지 디렉토리

## default-logo.jpg

기본 로고 이미지 파일을 이 디렉토리에 배치해주세요.

### 권장 사양
- 파일명: `default-logo.jpg`
- 크기: 200x200px 이상
- 형식: JPG, PNG
- 용량: 100KB 이하 (최적화 권장)

### 생성 방법

1. **온라인 도구 사용**:
   - https://placeholder.com/ 에서 임시 이미지 생성
   - https://via.placeholder.com/200x200.jpg/7D9675/ffffff?text=Logo

2. **직접 제작**:
   - Figma, Photoshop, Canva 등 디자인 도구 사용
   - 브랜드 색상 (#7D9675) 활용

3. **명령어로 생성** (macOS/Linux):
```bash
# ImageMagick 사용 (설치 필요)
convert -size 200x200 xc:#7D9675 -gravity center \
    -pointsize 40 -fill white -annotate +0+0 "LOGO" \
    default-logo.jpg
```

## 추가 이미지

업체 로고 이미지는 외부 URL을 사용하거나, 이 디렉토리에 업로드하여 사용할 수 있습니다.

### 파일명 규칙
- `partner-{id}.jpg` (예: partner-001.jpg)
- 또는 업체명 사용 (영문, 하이픈으로 구분)

### 최적화 권장사항
- WebP 형식 사용 (용량 30% 절감)
- 최대 크기: 500x500px
- 압축: https://tinypng.com/ 사용
