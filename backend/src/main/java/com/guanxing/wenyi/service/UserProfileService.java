package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.guanxing.wenyi.entity.UserProfile;
import com.guanxing.wenyi.mapper.UserProfileMapper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** 解析 / 懒创建 mock 用户（无登录注册）。 */
@Service
public class UserProfileService {

    private final UserProfileMapper userProfileMapper;

    public UserProfileService(UserProfileMapper userProfileMapper) {
        this.userProfileMapper = userProfileMapper;
    }

    /** 按外部标识取得内部用户主键；不存在则创建一个匿名用户。 */
    public String resolveOrCreate(String externalId) {
        UserProfile existing = userProfileMapper.selectOne(
                new QueryWrapper<UserProfile>().eq("external_user_id", externalId).last("limit 1"));
        if (existing != null) {
            return existing.getId();
        }
        UserProfile created = new UserProfile();
        created.setId(UUID.randomUUID().toString());
        created.setExternalUserId(externalId);
        created.setIsAnonymous(true);
        created.setCreatedAt(OffsetDateTime.now());
        created.setUpdatedAt(OffsetDateTime.now());
        userProfileMapper.insert(created);
        return created.getId();
    }
}
