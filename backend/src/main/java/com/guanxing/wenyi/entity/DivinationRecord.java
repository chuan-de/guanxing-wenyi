package com.guanxing.wenyi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.time.OffsetDateTime;
import java.util.List;

@TableName(value = "divination_record", autoResultMap = true)
public class DivinationRecord {

    @TableId(type = IdType.INPUT)
    private String id;
    private String userId;
    private String originalQuestion;
    private String question;
    private String questionType;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> refinedQuestions;
    private String hexName;
    private String hexPinyin;
    private String hexMeaning;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Boolean> hexLines;

    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<Integer> changingLines;

    private String changingToName;
    private String changingToPinyin;
    private String readingPoem;
    private String readingXiang;
    private String readingYi;
    private String readingXing;
    private String reflectQuestion;
    private String readingSummary;
    private Boolean interpreted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getOriginalQuestion() { return originalQuestion; }
    public void setOriginalQuestion(String originalQuestion) { this.originalQuestion = originalQuestion; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public List<String> getRefinedQuestions() { return refinedQuestions; }
    public void setRefinedQuestions(List<String> refinedQuestions) { this.refinedQuestions = refinedQuestions; }
    public String getHexName() { return hexName; }
    public void setHexName(String hexName) { this.hexName = hexName; }
    public String getHexPinyin() { return hexPinyin; }
    public void setHexPinyin(String hexPinyin) { this.hexPinyin = hexPinyin; }
    public String getHexMeaning() { return hexMeaning; }
    public void setHexMeaning(String hexMeaning) { this.hexMeaning = hexMeaning; }
    public List<Boolean> getHexLines() { return hexLines; }
    public void setHexLines(List<Boolean> hexLines) { this.hexLines = hexLines; }
    public List<Integer> getChangingLines() { return changingLines; }
    public void setChangingLines(List<Integer> changingLines) { this.changingLines = changingLines; }
    public String getChangingToName() { return changingToName; }
    public void setChangingToName(String changingToName) { this.changingToName = changingToName; }
    public String getChangingToPinyin() { return changingToPinyin; }
    public void setChangingToPinyin(String changingToPinyin) { this.changingToPinyin = changingToPinyin; }
    public String getReadingPoem() { return readingPoem; }
    public void setReadingPoem(String readingPoem) { this.readingPoem = readingPoem; }
    public String getReadingXiang() { return readingXiang; }
    public void setReadingXiang(String readingXiang) { this.readingXiang = readingXiang; }
    public String getReadingYi() { return readingYi; }
    public void setReadingYi(String readingYi) { this.readingYi = readingYi; }
    public String getReadingXing() { return readingXing; }
    public void setReadingXing(String readingXing) { this.readingXing = readingXing; }
    public String getReflectQuestion() { return reflectQuestion; }
    public void setReflectQuestion(String reflectQuestion) { this.reflectQuestion = reflectQuestion; }
    public String getReadingSummary() { return readingSummary; }
    public void setReadingSummary(String readingSummary) { this.readingSummary = readingSummary; }
    public Boolean getInterpreted() { return interpreted; }
    public void setInterpreted(Boolean interpreted) { this.interpreted = interpreted; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
