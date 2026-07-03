package com.guanxing.wenyi.service.ai.client;

/** 模型客户端调用失败（网络/超时/鉴权/返回格式不合法）。上层捕获后回退 mock。 */
public class AiClientException extends RuntimeException {

    public AiClientException(String message) {
        super(message);
    }

    public AiClientException(String message, Throwable cause) {
        super(message, cause);
    }
}
