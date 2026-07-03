-- 种子用户：anonymous + 演示用户「林徐之」（联调时 X-User-Id: demo-user）

INSERT INTO user_profile (id, external_user_id, display_name, is_anonymous,
                          sun_sign, moon_sign, rising_sign, birth_year, birth_term)
VALUES ('00000000-0000-0000-0000-000000000001', 'anonymous', '访客', true,
        NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (external_user_id) DO NOTHING;

INSERT INTO user_profile (id, external_user_id, display_name, is_anonymous,
                          sun_sign, moon_sign, rising_sign, birth_year, birth_term)
VALUES ('00000000-0000-0000-0000-000000000002', 'demo-user', '林徐之', false,
        '双鱼', '巨蟹', '天秤', 1992, '春分')
ON CONFLICT (external_user_id) DO NOTHING;
