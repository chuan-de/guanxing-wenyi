package com.guanxing.wenyi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@TableName(value = "relationship_profile", autoResultMap = true)
public class RelationshipProfile {

    @TableId(type = IdType.INPUT)
    private String id;
    private String userId;
    private String selfName;
    private String selfSign;
    private String selfBirth;
    private String partnerName;
    private String partnerSign;
    private String partnerBirth;
    private String relationHexName;
    private String relationHexPinyin;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Boolean> relationHexLines;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> analysis;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private Map<String, Object> chart;

    private String closingLine;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getSelfName() { return selfName; }
    public void setSelfName(String selfName) { this.selfName = selfName; }
    public String getSelfSign() { return selfSign; }
    public void setSelfSign(String selfSign) { this.selfSign = selfSign; }
    public String getSelfBirth() { return selfBirth; }
    public void setSelfBirth(String selfBirth) { this.selfBirth = selfBirth; }
    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }
    public String getPartnerSign() { return partnerSign; }
    public void setPartnerSign(String partnerSign) { this.partnerSign = partnerSign; }
    public String getPartnerBirth() { return partnerBirth; }
    public void setPartnerBirth(String partnerBirth) { this.partnerBirth = partnerBirth; }
    public String getRelationHexName() { return relationHexName; }
    public void setRelationHexName(String relationHexName) { this.relationHexName = relationHexName; }
    public String getRelationHexPinyin() { return relationHexPinyin; }
    public void setRelationHexPinyin(String relationHexPinyin) { this.relationHexPinyin = relationHexPinyin; }
    public List<Boolean> getRelationHexLines() { return relationHexLines; }
    public void setRelationHexLines(List<Boolean> relationHexLines) { this.relationHexLines = relationHexLines; }
    public Map<String, Object> getAnalysis() { return analysis; }
    public void setAnalysis(Map<String, Object> analysis) { this.analysis = analysis; }
    public Map<String, Object> getChart() { return chart; }
    public void setChart(Map<String, Object> chart) { this.chart = chart; }
    public String getClosingLine() { return closingLine; }
    public void setClosingLine(String closingLine) { this.closingLine = closingLine; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
