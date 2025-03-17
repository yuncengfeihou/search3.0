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
        <div class="message-retriever-extension">
            <div class="keyword-search-area">
                <input type="text" id="keyword-input" class="keyword-input" placeholder="关键词检索" />
                <input type="submit" id="keyword-search-button" class="menu_button" value="清空" />
            </div>
            <div class="quick-scroll-area">
                <input type="button" id="scroll-to-top-button" class="menu_button" value="↑" title="滚动到最早消息" />
                <input type="button" id="jump-to-floor-button" class="menu_button" value="跳转指定楼层" />
                <input type="button" id="scroll-to-bottom-button" class="menu_button" value="↓" title="滚动到最新消息" />
            </div>
            <div class="settings-button-area">
                <input type="button" id="advanced-settings-button" class="menu_button" value="高级检索设置" />
            </div>
            <div id="advanced-settings-panel" class="advanced-settings-panel" style="display:none;">
                <div class="settings-group">
                    <label for="realtime-render-checkbox">检索渲染:</label>
                    <input type="checkbox" id="realtime-render-checkbox" />  实时渲染
                </div>
                <div class="settings-group">
                    <label for="keyword-highlight-checkbox">关键词提亮:</label>
                    <input type="checkbox" id="keyword-highlight-checkbox" /> 关键词提亮
                </div>
                <input type="button" id="save-settings-button" class="menu_button" value="保存" />
            </div>
            <div id="error-message-area" class="error-message-area" style="display:none;"></div>
        </div>
    `;

    $("#character_block").before(settingsHtml); // 将插件UI添加到角色信息块之前

    // 按钮和输入框事件绑定将在后面的步骤中添加
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
