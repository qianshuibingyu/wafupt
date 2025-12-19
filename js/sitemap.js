// 网站地图交互功能
document.addEventListener('DOMContentLoaded', function () {
    // 获取所有卡片头部
    const cardHeaders = document.querySelectorAll('.card-header');

    // 点击卡片头部展开/收起内容
    cardHeaders.forEach(header => {
        header.addEventListener('click', function () {
            // 获取目标内容区域ID
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const card = this.closest('.sitemap-card');

            // 切换显示/隐藏
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                card.classList.remove('active');
            } else {
                // 关闭其他打开的面板
                document.querySelectorAll('.card-content.active').forEach(activeContent => {
                    activeContent.classList.remove('active');
                    activeContent.closest('.sitemap-card').classList.remove('active');
                });

                // 打开当前面板
                content.classList.add('active');
                card.classList.add('active');
            }
        });
    });

 
    // 页面加载时默认展开第一个面板
    if (cardHeaders.length > 0) {
        const firstHeader = cardHeaders[0];
        const firstTargetId = firstHeader.getAttribute('data-target');
        const firstContent = document.getElementById(firstTargetId);
        const firstCard = firstHeader.closest('.sitemap-card');

        if (firstContent) {
            firstContent.classList.add('active');
            firstCard.classList.add('active');
        }
    }
});