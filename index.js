import { extension_settings, saveSettingsDebounced, callGenericPopup } from "../../../extensions.js";

const extensionName = "message-retriever";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];

const defaultSettings = {
    realTimeRender: true,
    keywordHighlight: true
};

async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }
}

function saveSettings() {
    saveSettingsDebounced();
}

let chatHistory = []; // 用于存储当前聊天记录，从 getContext().chat 获取

async function getChatMessages() {
    chatHistory = getContext().chat;
    //console.log("更新聊天记录:", chatHistory); // 可以选择性地打印聊天记录用于调试
}


function createUI() {
    const settingsHtml = `
        <div id="search-plugin-ui">  <!-- 修改主容器为 id="search-plugin-ui" -->
            <div class="keyword-search">  <!-- 修改 class="keyword-search-area" 为 class="keyword-search" -->
                <input type="text" id="keyword-input" class="keyword-input" placeholder="关键词检索" />
                <button id="keyword-search-button">清空</button>  <!-- 修改 input type="submit" 为 button 标签 -->
            </div>
            <div class="scroll-buttons">  <!-- 修改 class="quick-scroll-area" 为 class="scroll-buttons" -->
                <button id="scroll-to-top-button" title="滚动到最早消息">↑</button>  <!-- 修改 input type="button" 为 button 标签 -->
                <button id="jump-to-floor-button">跳转指定楼层</button>  <!-- 修改 input type="button" 为 button 标签 -->
                <button id="scroll-to-bottom-button" title="滚动到最新消息">↓</button>  <!-- 修改 input type="button" 为 button 标签 -->
            </div>
            <div class="advanced-settings-button-area">  <!-- 保留 class="advanced-settings-button-area" (CSS 中也有这个类名) -->
                <button id="advanced-settings-btn">高级检索设置</button>  <!-- 修改 input type="button" 和 id 为 CSS 中使用的 #advanced-settings-btn -->
            </div>
            <div id="advanced-settings-panel" class="advanced-settings-panel hidden">  <!-- 保留 id="advanced-settings-panel" 和 class="advanced-settings-panel"，并添加 class="hidden" 初始化隐藏 -->
                <label for="realtime-render-radio">检索渲染:</label>
                <div class="settings-group">
                    <input type="radio" id="realtime-render-radio-realtime" name="render_mode" value="realtime" checked /> 实时渲染
                </div>
                <div class="settings-group">
                    <input type="radio" id="realtime-render-radio-confirm" name="render_mode" value="confirm" /> 确定渲染
                </div>

                <label for="keyword-highlight-checkbox">关键词提亮:</label>
                <input type="checkbox" id="keyword-highlight-checkbox" checked /> 启用关键词提亮

                <button id="save-settings">保存</button>  <!-- 修改 input type="button" 和 id 为 CSS 中使用的 #save-settings -->
            </div>
            <div id="floor-jump-popup" class="hidden">  <!-- 添加 楼层跳转弹窗 HTML 结构，并初始化隐藏 -->
                <label for="floor-input">跳转楼层:</label>
                <input type="number" id="floor-input" placeholder="输入楼层号">
                <div id="floor-info"></div>
                <button id="jump-button-floor-popup">跳转</button> <!-- 可以添加跳转按钮，如果需要 -->
            </div>
            <div id="error-message-area" class="error-message-area hidden"></div>  <!-- 初始化隐藏错误信息区域 -->
        </div>
    `;

    $("#character_block").before(settingsHtml); // 将插件UI添加到角色信息块之前
}


jQuery(async () => {
    await loadSettings();
    createUI();

    // 初始化设置面板状态
    $("#realtime-render-checkbox").prop("checked", extensionSettings.realTimeRender);
    $("#keyword-highlight-checkbox").prop("checked", extensionSettings.keywordHighlight);

    // 根据设置初始化按钮文本
    updateSearchButtonText();

    // 绑定事件监听器将在后面的步骤中添加
});

function updateSearchButtonText() {
    const button = $("#keyword-search-button");
    const realtimeRenderCheckbox = $("#realtime-render-checkbox");

    if (realtimeRenderCheckbox.prop("checked")) {
        button.val("清空");
    } else {
        button.val("确定");
    }
}
