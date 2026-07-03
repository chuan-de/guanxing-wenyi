package com.guanxing.wenyi.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@TableName("mood_journal")
public class MoodJournal {

    @TableId(type = IdType.INPUT)
    private String id;
    private String userId;
    private String mood;
    private Integer stress;
    private String smallThing;
    private LocalDate entryDate;
    private OffsetDateTime createdAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }
    public Integer getStress() { return stress; }
    public void setStress(Integer stress) { this.stress = stress; }
    public String getSmallThing() { return smallThing; }
    public void setSmallThing(String smallThing) { this.smallThing = smallThing; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
