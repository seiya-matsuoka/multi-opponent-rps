package com.github.seiyamatsuoka.multiopponentrps.config;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS設定。
 *
 * <p>目的：
 *
 * <ul>
 *   <li>フロント（別オリジン）から /api/** を呼べるようにする
 *   <li>許可オリジンは環境ごとに切り替え可能にする（環境変数 or localプロファイル）
 * </ul>
 *
 * <p>allowed-origins が未設定（空）の場合は許可しない挙動にする。
 */
@Configuration
@EnableConfigurationProperties(AppCorsProperties.class)
public class CorsConfig implements WebMvcConfigurer {

  private final AppCorsProperties corsProperties;

  public CorsConfig(AppCorsProperties corsProperties) {
    this.corsProperties = corsProperties;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    List<String> allowedOrigins = normalizeOrigins(corsProperties.allowedOrigins());

    // 未設定の場合はCORSを有効にしない（ブラウザからの別オリジン呼び出しは通らない）
    // ローカル開発時は application-local.yml / 環境変数で必ず設定して運用する想定
    if (allowedOrigins.isEmpty()) {
      return;
    }

    registry
        .addMapping("/api/**")
        .allowedOrigins(allowedOrigins.toArray(new String[0]))
        .allowedMethods("GET", "POST", "OPTIONS")
        .allowedHeaders("*")
        // Cookie認証等は今回不要なので false のままとする（必要になったら true にして originsも厳密にする）
        .allowCredentials(false)
        // preflight（OPTIONS）のキャッシュ秒数
        .maxAge(3600);
  }

  /**
   * オリジンの設定値を正規化する。
   *
   * <ul>
   *   <li>null/空/空白のみ → 除外
   *   <li>カンマ区切りが入っていたら分解（環境変数の指定を許容）
   * </ul>
   *
   * @param origins 設定上のオリジン一覧（application.ymlから読み込まれる値）
   * @return 正規化後のオリジン一覧
   */
  private List<String> normalizeOrigins(List<String> origins) {
    if (origins == null) {
      return List.of();
    }

    return origins.stream()
        .flatMap(v -> List.of(v.split(",")).stream())
        .map(String::trim)
        .filter(s -> !s.isBlank())
        .distinct()
        .collect(Collectors.toList());
  }
}
