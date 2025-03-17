import { extension_settings, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced, getContext } from "../../../../script.js";

jQuery(async () => {
    const settingsHtml = `
        <div class="message-retrieval-extension">
            <div class="keyword-search-area">
                <input type="text" id="keyword-input" class="keyword-input" placeholder="关键词检索" />
                <input type="button" id="keyword-button" class="keyword-button" value="清空" />
            </div>
            <div class="quick-scroll-area">
                <input type="button" id="scroll-up-button" class="scroll-button" value="↑" />
                <input type="button" id="jump-floor-button" class="jump-floor-button" value="跳转指定楼层" />
                <input type="button" id="scroll-down-button" class="scroll-button" value="↓" />
            </div>
            <div class="advanced-settings-button-area">
                <input type="button" id="advanced-settings-button" class="advanced-settings-button" value="高级检索设置" />
            </div>
            <div id="advanced-settings-panel" class="advanced-settings-panel" style="display:none;">
                <div class="settings-group">
                    <label>检索渲染:</label>
                    <label><input type="radio" name="render-mode" value="realtime" checked /> 实时渲染</label>
                    <label><input type="radio" name="render-mode" value="ondemand" /> 点击确定渲染</label>
                </div>
                <div class="settings-group">
                    <label>关键词提亮:</label>
                    <input type="checkbox" id="highlight-keywords" checked />
                </div>
                <input type="button" id="save-settings-button" class="save-settings-button" value="保存" />
            </div>
            <div id="error-message-area" class="error-message-area" style="display:none;"></div>
        </div>
    `;
    $("#extensions_settings").append(settingsHtml);

    const extensionName = "message-retrieval"; // 插件文件夹名称
    const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
    const extensionSettings = extension_settings[extensionName];
    const defaultSettings = {
        renderMode: "realtime", // 默认检索渲染模式：实时渲染
        highlightKeywords: true, // 默认关键词提亮：启用
    };

    let currentKeyword = ""; // 当前关键词检索关键词
    let isRealtimeRender = true; // 是否实时渲染
    let isHighlightKeywords = true; // 是否关键词提亮


    async function loadSettings() {
        extension_settings[extensionName] = extension_settings[extensionName] || {};
        if (Object.keys(extension_settings[extensionName]).length === 0) {
            Object.assign(extension_settings[extensionName], defaultSettings);
        }

        isRealtimeRender = extension_settings[extensionName].renderMode !== "ondemand";
        isHighlightKeywords = extension_settings[extensionName].highlightKeywords !== false;

        // 更新 UI 状态，例如单选框和复选框的选中状态
        $(`input[name="render-mode"][value="${extension_settings[extensionName].renderMode}"]`).prop("checked", true);
        $("#highlight-keywords").prop("checked", isHighlightKeywords);

        updateKeywordButtonText(); // 更新关键词按钮文本
    }

    function saveSettings() {
        extension_settings[extensionName].renderMode = isRealtimeRender ? "realtime" : "ondemand";
        extension_settings[extensionName].highlightKeywords = isHighlightKeywords;
        saveSettingsDebounced();
    }


    function performKeywordSearch(keyword) {
        // 关键词检索核心逻辑
        const chat = getContext().chat; // 获取聊天记录

        if (!chat || chat.length === 0) {
            showErrorMessage("当前没有聊天消息!");
            return;
        }

        const searchResults = [];
        const lowerKeyword = keyword.toLowerCase(); // 关键词转换为小写，忽略大小写

        for (let i = 0; i < chat.length; i++) {
            const message = chat[i];
            if (message && message.mes) {
                const lowerMessage = message.mes.toLowerCase(); // 消息内容转换为小写，忽略大小写
                if (lowerMessage.includes(lowerKeyword)) {
                    searchResults.push({
                        mesid: i,
                        content: message.mes,
                    });
                }
            }
        }

        if (searchResults.length > 0) {
            // 显示检索结果，这里为了简化，只滚动到第一个匹配项
            scrollToMessage(searchResults[0].mesid);
            if (isHighlightKeywords) {
                highlightKeywordsInMessage(searchResults[0].mesid, keyword); // 高亮关键词
            }
        } else {
            showErrorMessage(`未找到包含关键词 "${keyword}" 的消息!`);
        }
    }

    function scrollToMessage(mesid) {
        // 滚动到指定 mesid 的消息位置
        const messageElement = document.querySelector(`.mes[mesid="${mesid}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({
                behavior: 'smooth', // 平滑滚动
                block: 'start' // 元素顶部与视口顶部对齐
            });
        }
    }

    function highlightKeywordsInMessage(mesid, keyword) {
        // 高亮消息内容中的关键词
        const messageElement = document.querySelector(`.mes[mesid="${mesid}"] .mes_text`);
        if (messageElement) {
            let highlightedContent = messageElement.innerHTML; // 获取消息内容 HTML
            const regex = new RegExp(keyword, "gi"); // 创建正则表达式，忽略大小写
            highlightedContent = highlightedContent.replace(regex, `<span class="highlighted-keyword">$&</span>`); // 替换关键词为高亮 HTML
            messageElement.innerHTML = highlightedContent; // 更新消息内容 HTML
        }
    }


    function clearKeywordSearch() {
        // 清空关键词检索框和相关状态
        $("#keyword-input").val("");
        currentKeyword = "";
        resetHighlighting(); // 移除高亮显示
    }

    function resetHighlighting() {
        // 移除所有高亮显示
        $(".mes_text .highlighted-keyword").each(function() {
            $(this).replaceWith($(this).html()); // 替换高亮 span 为原始文本
        });
    }

    function updateKeywordButtonText() {
        // 更新关键词按钮文本，根据是否实时渲染显示 [清空] 或 [确定]
        const buttonText = isRealtimeRender ? "清空" : "确定";
        $("#keyword-button").val(buttonText);
    }


    // 关键词输入框事件监听器
    $("#keyword-input").on("input", function() {
        currentKeyword = $(this).val();
        if (isRealtimeRender) {
            if (currentKeyword) {
                performKeywordSearch(currentKeyword); // 实时检索
            } else {
                resetHighlighting(); // 清空关键词时移除高亮
            }
        }
    });

    // 关键词按钮点击事件监听器
    $("#keyword-button").on("click", function() {
        if (isRealtimeRender) {
            clearKeywordSearch(); // 实时渲染模式下点击 [清空] 按钮
        } else {
            performKeywordSearch(currentKeyword); // 点击确定按钮执行检索
        }
        $("#keyword-input").blur(); // 让关键词输入框失去焦点
    });

    // 关键词输入框回车事件监听器
    $("#keyword-input").on("keydown", function(event) {
        if (event.key === "Enter" && !isRealtimeRender) {
            performKeywordSearch(currentKeyword); // 回车执行检索 (非实时渲染模式)
            $("#keyword-input").blur(); // 让关键词输入框失去焦点
        }
    });


    // 向上滚动按钮点击事件监听器
    $("#scroll-up-button").on("click", function() {
        const chat = getContext().chat;
        if (chat && chat.length > 0) {
            scrollToMessage(0); // 滚动到第一条消息 (mesid 0)
        }
    });

    // 向下滚动按钮点击事件监听器
    $("#scroll-down-button").on("click", function() {
        const chat = getContext().chat;
        if (chat && chat.length > 0) {
            scrollToMessage(chat.length - 1); // 滚动到最后一条消息 (mesid chat.length - 1)
        }
    });


    function toggleAdvancedSettingsPanel() {
        // 切换高级设置面板显示/隐藏
        $("#advanced-settings-panel").toggle();
    }

    // 高级检索设置按钮点击事件监听器
    $("#advanced-settings-button").on("click", toggleAdvancedSettingsPanel);

    // 检索渲染模式单选框 change 事件监听器
    $('input[name="render-mode"]').on("change", function() {
        isRealtimeRender = $(this).val() === "realtime";
        updateKeywordButtonText(); // 更新关键词按钮文本
    });

    // 关键词提亮复选框 change 事件监听器
    $("#highlight-keywords").on("change", function() {
        isHighlightKeywords = $(this).prop("checked");
    });

    // 保存设置按钮点击事件监听器
    $("#save-settings-button").on("click", function() {
        saveSettings(); // 保存设置
        toggleAdvancedSettingsPanel(); // 关闭设置面板
    });


    function showErrorMessage(message) {
        // 显示错误信息
        $("#error-message-area").text(message).show();
        setTimeout(hideErrorMessage, 3000); // 3秒后自动隐藏错误信息
    }

    function hideErrorMessage() {
        // 隐藏错误信息
        $("#error-message-area").hide().text("");
    }

    loadSettings(); // 加载插件设置
});