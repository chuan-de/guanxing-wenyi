package com.guanxing.wenyi;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.guanxing.wenyi.mapper")
public class GuanxingWenyiApplication {
    public static void main(String[] args) {
        SpringApplication.run(GuanxingWenyiApplication.class, args);
    }
}
