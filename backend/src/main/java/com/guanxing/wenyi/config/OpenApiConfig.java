package com.guanxing.wenyi.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class OpenApiConfig {

    @Bean
    public OpenAPI guanxingWenyiOpenApi() {
        return new OpenAPI().info(new Info()
                .title("观星问易 后端 API")
                .description("第一阶段 mock 骨架。请求头 X-User-Id 标识用户（缺省 anonymous）。")
                .version("0.0.1"));
    }
}
