import { extension_settings } from "../../../extensions.js";
import { getContext } from "../../../extensions.js";
import { callGenericPopup } from '../../../popup.js';

const pluginName = "message-retriever-plugin";
const pluginDisplayName = "消息检索插件"; // 插件显示名称
const pluginSettings = extension_settings[pluginName];

// 默认设置
const defaultSettings = {
    realTimeRender: true,
    keywordHighlight: true
};

let currentSettings = { ...defaultSettings }; // 使用 currentSettings 跟踪当前设置

// 加载设置
async function loadSettings() {
    if (!pluginSettings) {
        extension_settings[pluginName] = { ...defaultSettings };
    }
    Object.assign(currentSettings, extension_settings[pluginName]);
}

// 保存设置
async function saveSettings() {
    extension_settings[pluginName] = { ...currentSettings };
    // 在这里添加保存设置到 SillyTavern 的代码，如果需要
    console.log(`${pluginDisplayName}: 设置已保存`, currentSettings);
}


// 插件 UI HTML 结构
let uiHtml = `
<div id="message_retriever_plugin">
    <div class="keyword-search-area">
        <input type="text" id="keyword_input" placeholder="关键词检索" />
        <button id="keyword_button">[清空]</button>
    </div>

    <div class="scroll-buttons">
        <button id="scroll_up_button">↑</button>
        <button id="jump_floor_button">[跳转指定楼层]</button>
        <button id="scroll_down_button">↓</button>
    </div>

    <button id="advanced_settings_button">[高级检索设置]</button>

    <div id="error_message_area" class="error-message"></div>
</div>

<div id="advanced_settings_panel" style="display:none; position:absolute; background-color:#fff; border:1px solid #ccc; padding:10px; border-radius:5px;">
    <h3>高级检索设置</h3>
    <div class="setting-item">
        <label><input type="checkbox" id="real_time_render_checkbox"> 实时渲染</label>
    </div>
    <div class="setting-item">
        <label><input type="checkbox" id="keyword_highlight_checkbox"> 关键词提亮</label>
    </div>
    <button id="save_settings_button">[保存]</button>
</div>
`;


jQuery(async () => {
    await loadSettings(); // 加载插件设置

    $("body").append(uiHtml); // 使用更可靠的选择器将 UI 添加到 body

    const pluginUI = $("#message_retriever_plugin");
    const keywordInput = $("#keyword_input");
    const keywordButton = $("#keyword_button");
    const scrollUpButton = $("#scroll_up_button");
    const jumpFloorButton = $("#jump_floor_button");
    const scrollDownButton = $("#scroll_down_button");
    const advancedSettingsButton = $("#advanced_settings_button");
    const errorMessageArea = $("#error_message_area");
    const advancedSettingsPanel = $("#advanced_settings_panel");
    const realTimeRenderCheckbox = $("#real_time_render_checkbox");
    const keywordHighlightCheckbox = $("#keyword_highlight_checkbox");
    const saveSettingsButton = $("#save_settings_button");


    // 初始化UI状态和设置
    realTimeRenderCheckbox.prop("checked", currentSettings.realTimeRender);
    keywordHighlightCheckbox.prop("checked", currentSettings.keywordHighlight);
    updateKeywordButtonText();


    // 更新关键词按钮文本 based on 实时渲染 setting
    function updateKeywordButtonText() {
        keywordButton.text(currentSettings.realTimeRender ? "[清空]" : "[确定]");
    }


    // ** 关键词检索区域 **

    // 关键词输入框事件 (实时检索 - 如果启用)
    keywordInput.on("input", function() {
        if (currentSettings.realTimeRender) {
            handleKeywordSearch(keywordInput.val()); // 实时检索
        }
    });

    // 关键词按钮点击事件
    keywordButton.on("click", function() {
        if (currentSettings.realTimeRender) {
            keywordInput.val(""); // 清空输入框
            keywordInput.blur(); // 移除焦点，停止实时检索 (如果需要)
            clearHighlighting(); // 清除高亮显示 (如果需要)
        } else {
            handleKeywordSearch(keywordInput.val()); // 确定检索
            keywordInput.blur(); // 移除焦点，停止检索
        }
    });


    // ** 快速滚动按钮区域 **

    // 向上滚动按钮
    scrollUpButton.on("click", function() {
        scrollTo earliestMessage"; // 替换为实际的滚动到最早消息的函数
        errorMessageArea.text(""); // 清空错误信息
    });

    // 跳转指定楼层按钮
    jumpFloorButton.on("click", function() {
        openJumpToFloorPopup(); // 打开楼层跳转弹窗
        errorMessageArea.text(""); // 清空错误信息
    });

    // 向下滚动按钮
    scrollDownButton.on("click", function() {
        scrollToLatestMessage(); // 替换为实际的滚动到最新消息的函数
        errorMessageArea.text(""); // 清空错误信息
    });


    // ** 高级检索设置 **

    // 高级检索设置按钮
    advancedSettingsButton.on("click", function() {
        advancedSettingsPanel.show(); // 显示设置面板
    });

    // 实时渲染复选框
    realTimeRenderCheckbox.on("change", function() {
        currentSettings.realTimeRender = $(this).prop("checked");
        updateKeywordButtonText(); // 更新按钮文本
    });

    // 关键词提亮复选框
    keywordHighlightCheckbox.on("change", function() {
        currentSettings.keywordHighlight = $(this).prop("checked");
        // 可以在这里更新关键词高亮状态 (如果需要立即应用)
    });

    // 保存设置按钮
    saveSettingsButton.on("click", async function() {
        await saveSettings(); // 保存设置
        advancedSettingsPanel.hide(); // 隐藏设置面板
        errorMessageArea.text(""); // 清空错误信息
        // 可以在保存设置后，更新 UI 的关键词高亮状态 (如果设置更改影响了高亮)
    });


    // ** 错误处理与提示 **
    function displayError(message) {
        errorMessageArea.text(message);
    }


    // ** 插件功能函数 (需要您补充完整) **

    // 处理关键词检索
    function handleKeywordSearch(keyword) {
        console.log(`${pluginDisplayName}: 执行关键词检索:`, keyword);
        // 在这里实现关键词检索的逻辑
        // 使用 getContext().chat 获取消息，并根据关键词检索
        // 根据 currentSettings.keywordHighlight 决定是否高亮关键词
        // 如果找不到匹配项，可以调用 displayError() 显示错误信息
    }

    // 清除关键词高亮显示 (如果需要实现关键词高亮功能)
    function clearHighlighting() {
        console.log(`${pluginDisplayName}: 清除关键词高亮显示`);
        // 在这里实现清除关键词高亮显示的逻辑 (如果需要)
    }

    // 滚动到最早消息
    function scrollToEarliestMessage() {
        console.log(`${pluginDisplayName}: 滚动到最早消息`);
        // 在这里实现滚动到最早消息的逻辑
        // 可以使用 getContext().chat 找到最早的消息 mesid，并滚动到对应位置
    }

    // 滚动到最新消息
    function scrollToLatestMessage() {
        console.log(`${pluginDisplayName}: 滚动到最新消息`);
        // 在这里实现滚动到最新消息的逻辑
        //  可以直接滚动到聊天窗口底部
    }

    // 打开楼层跳转弹窗
    function openJumpToFloorPopup() {
        console.log(`${pluginDisplayName}: 打开楼层跳转弹窗`);
        // 在这里实现打开楼层跳转弹窗的逻辑
        // 可以使用 callGenericPopup 或自定义弹窗实现
        // 弹窗中包含楼层输入框和实时显示楼层信息文本框
    }


    console.log(`${pluginDisplayName}: 插件已加载`);
});
