import React from "react";

const SimpleTest: React.FC = () => {
  return (
    <div style={{ padding: "20px", fontSize: "18px" }}>
      <h1>简单测试页面</h1>
      <p>如果您能看到这个页面，说明基本组件渲染正常。</p>
      <p>当前时间: {new Date().toLocaleString()}</p>
      <button onClick={() => alert("按钮点击正常！")}>
        点击测试
      </button>
    </div>
  );
};

export default SimpleTest;
