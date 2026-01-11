package com.github.seiyamatsuoka.multiopponentrps.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** アプリケーション固有の設定を application.yml から読み込むためのプロパティ定義。 */
@ConfigurationProperties(prefix = "app.cors")
public record AppCorsProperties(
    /** CORSで許可するオリジン一覧。 */
    List<String> allowedOrigins) {}
