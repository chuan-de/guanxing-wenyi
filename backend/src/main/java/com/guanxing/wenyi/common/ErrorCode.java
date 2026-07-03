package com.guanxing.wenyi.common;

public enum ErrorCode {
    SUCCESS(0, "ok"),
    PARAM_INVALID(1001, "参数校验失败"),
    NOT_FOUND(1002, "资源不存在"),
    RATE_LIMITED(1003, "请求过于频繁，请稍后再试"),
    INTERNAL_ERROR(5000, "服务器内部错误");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
