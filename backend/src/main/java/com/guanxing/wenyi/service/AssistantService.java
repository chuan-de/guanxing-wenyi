package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.guanxing.wenyi.common.BizException;
import com.guanxing.wenyi.common.ErrorCode;
import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.ChatMessageDTO;
import com.guanxing.wenyi.dto.response.ChatResponse;
import com.guanxing.wenyi.entity.AssistantConversation;
import com.guanxing.wenyi.entity.AssistantMessage;
import com.guanxing.wenyi.mapper.AssistantConversationMapper;
import com.guanxing.wenyi.mapper.AssistantMessageMapper;
import com.guanxing.wenyi.service.ai.AiService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AssistantService {

    private final AiService aiService;
    private final AiRequestLogService aiRequestLogService;
    private final AssistantConversationMapper conversationMapper;
    private final AssistantMessageMapper messageMapper;

    public AssistantService(AiService aiService, AiRequestLogService aiRequestLogService,
                            AssistantConversationMapper conversationMapper,
                            AssistantMessageMapper messageMapper) {
        this.aiService = aiService;
        this.aiRequestLogService = aiRequestLogService;
        this.conversationMapper = conversationMapper;
        this.messageMapper = messageMapper;
    }

    public ChatResponse chat(String conversationId, String message) {
        long t0 = System.currentTimeMillis();
        String userId = UserContext.currentUserId();
        OffsetDateTime now = OffsetDateTime.now();

        AssistantConversation conversation = resolveConversation(conversationId, userId, message, now);

        List<AssistantMessage> prior = messageMapper.selectList(new QueryWrapper<AssistantMessage>()
                .eq("conversation_id", conversation.getId())
                .orderByAsc("seq"));
        int base = prior.size();

        AssistantMessage userMsg = newMessage(conversation.getId(), userId, "user", message, base + 1, now);
        messageMapper.insert(userMsg);

        List<AiService.ChatTurn> history = prior.stream()
                .map(m -> new AiService.ChatTurn(m.getRole(), m.getContent()))
                .toList();
        String replyText = aiService.chatReply(history, message);
        AssistantMessage replyMsg = newMessage(conversation.getId(), userId, "assistant", replyText, base + 2, now);
        messageMapper.insert(replyMsg);

        conversation.setLastMessageAt(now);
        conversation.setUpdatedAt(now);
        conversationMapper.updateById(conversation);

        ChatResponse resp = new ChatResponse(
                conversation.getId(),
                userMsg.getId(),
                new ChatMessageDTO(replyMsg.getId(), "assistant", replyText, epochMillis(now)));
        aiRequestLogService.record("chat", aiService.providerName(), aiService.modelName(),
                Map.of("conversationId", conversation.getId(), "message", message), resp,
                System.currentTimeMillis() - t0);
        return resp;
    }

    private AssistantConversation resolveConversation(String conversationId, String userId,
                                                     String firstMessage, OffsetDateTime now) {
        if (StringUtils.hasText(conversationId)) {
            AssistantConversation existing = conversationMapper.selectById(conversationId);
            if (existing == null) {
                throw new BizException(ErrorCode.NOT_FOUND, "会话不存在");
            }
            return existing;
        }
        AssistantConversation created = new AssistantConversation();
        created.setId(UUID.randomUUID().toString());
        created.setUserId(userId);
        created.setTitle(firstMessage.length() > 20 ? firstMessage.substring(0, 20) : firstMessage);
        created.setContextSnapshot(Map.of(
                "todayAstro", "月在巨蟹，水象当令",
                "moon", "盈凸月",
                "recentHex", "风山渐"));
        created.setLastMessageAt(now);
        created.setCreatedAt(now);
        created.setUpdatedAt(now);
        conversationMapper.insert(created);
        return created;
    }

    private static AssistantMessage newMessage(String conversationId, String userId, String role,
                                              String content, int seq, OffsetDateTime now) {
        AssistantMessage m = new AssistantMessage();
        m.setId(UUID.randomUUID().toString());
        m.setConversationId(conversationId);
        m.setUserId(userId);
        m.setRole(role);
        m.setContent(content);
        m.setSeq(seq);
        m.setCreatedAt(now);
        return m;
    }

    private static long epochMillis(OffsetDateTime t) {
        return t.toInstant().toEpochMilli();
    }
}
