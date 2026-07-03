package com.guanxing.wenyi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.OffsetDateTime;

@TableName("user_profile")
public class UserProfile {

    @TableId(type = IdType.INPUT)
    private String id;
    private String externalUserId;
    private String displayName;
    private Boolean isAnonymous;
    private String sunSign;
    private String moonSign;
    private String risingSign;
    private Integer birthYear;
    private String birthTerm;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getExternalUserId() { return externalUserId; }
    public void setExternalUserId(String externalUserId) { this.externalUserId = externalUserId; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }
    public String getSunSign() { return sunSign; }
    public void setSunSign(String sunSign) { this.sunSign = sunSign; }
    public String getMoonSign() { return moonSign; }
    public void setMoonSign(String moonSign) { this.moonSign = moonSign; }
    public String getRisingSign() { return risingSign; }
    public void setRisingSign(String risingSign) { this.risingSign = risingSign; }
    public Integer getBirthYear() { return birthYear; }
    public void setBirthYear(Integer birthYear) { this.birthYear = birthYear; }
    public String getBirthTerm() { return birthTerm; }
    public void setBirthTerm(String birthTerm) { this.birthTerm = birthTerm; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
