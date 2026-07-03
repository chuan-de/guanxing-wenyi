package com.guanxing.wenyi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.time.OffsetDateTime;

@TableName(value = "ai_request_log", autoResultMap = true)
public class AiRequestLog {

    @TableId(type = IdType.INPUT)
    private String id;
    private String userId;
    private String requestType;
    private String provider;
    private String model;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object requestPayload;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Object responsePayload;

    private String status;
    private String errorMessage;
    private Integer latencyMs;
    private OffsetDateTime createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Object getRequestPayload() { return requestPayload; }
    public void setRequestPayload(Object requestPayload) { this.requestPayload = requestPayload; }
    public Object getResponsePayload() { return responsePayload; }
    public void setResponsePayload(Object responsePayload) { this.responsePayload = responsePayload; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Integer getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Integer latencyMs) { this.latencyMs = latencyMs; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
