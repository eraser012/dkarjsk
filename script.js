// 게시글 데이터 관리
let posts = [];
let currentDepartment = 'all'; // 현재 선택된 과

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    loadPosts();
    // 초기 지도 영역 활성화 상태 설정
    document.querySelectorAll('.map-area').forEach(area => {
        area.classList.remove('active');
        if (area.dataset.department === currentDepartment) {
            area.classList.add('active');
            area.setAttribute('stroke', '#1a1a1a');
            area.setAttribute('stroke-width', '1.5');
        } else {
            area.setAttribute('stroke', '#1a1a1a');
            area.setAttribute('stroke-width', '1');
        }
    });
    renderPosts();
});

// localStorage에서 게시글 불러오기
function loadPosts() {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
}

// localStorage에 게시글 저장하기
function savePosts() {
    localStorage.setItem('communityPosts', JSON.stringify(posts));
}

// 과별 커뮤니티 전환
function switchDepartment(department) {
    currentDepartment = department;
    
    // 탭 버튼 활성화 상태 업데이트
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.department === department) {
            btn.classList.add('active');
        }
    });
    
    // 지도 영역 활성화 상태 업데이트
    document.querySelectorAll('.map-area').forEach(area => {
        area.classList.remove('active');
        if (area.dataset.department === department) {
            area.classList.add('active');
            area.setAttribute('stroke', '#1a1a1a');
            area.setAttribute('stroke-width', '1.5');
        } else {
            area.setAttribute('stroke', '#1a1a1a');
            area.setAttribute('stroke-width', '1');
        }
    });
    
    renderPosts();
}

// 작성자 입력 필드 토글
function toggleAuthorInput() {
    const authorType = document.querySelector('input[name="authorType"]:checked').value;
    const authorNameInput = document.getElementById('authorName');
    
    if (authorType === 'anonymous') {
        authorNameInput.disabled = true;
        authorNameInput.required = false;
        authorNameInput.value = '';
        authorNameInput.placeholder = '익명으로 작성됩니다';
    } else {
        authorNameInput.disabled = false;
        authorNameInput.required = true;
        authorNameInput.placeholder = '예: 2학년 3반 15번 또는 홍길동';
    }
}

// 게시글 작성 폼 표시
function showCreateForm() {
    document.getElementById('createForm').classList.remove('hidden');
    // 현재 선택된 과를 기본값으로 설정
    document.getElementById('postDepartment').value = currentDepartment;
    // 실명 선택을 기본값으로 설정
    document.querySelector('input[name="authorType"][value="named"]').checked = true;
    toggleAuthorInput();
    document.getElementById('postTitle').focus();
}

// 게시글 작성 폼 숨기기
function hideCreateForm() {
    document.getElementById('createForm').classList.add('hidden');
    document.getElementById('createForm').reset();
}

// 새 게시글 생성
function createPost(event) {
    event.preventDefault();
    
    const department = document.getElementById('postDepartment').value;
    const authorType = document.querySelector('input[name="authorType"]:checked').value;
    const authorNameInput = document.getElementById('authorName');
    const postTitle = document.getElementById('postTitle').value.trim();
    const postContent = document.getElementById('postContent').value.trim();
    
    // 실명 선택 시에만 이름 필수
    let authorName;
    if (authorType === 'anonymous') {
        authorName = '익명';
    } else {
        authorName = authorNameInput.value.trim();
        if (!authorName) {
            alert('작성자 이름을 입력해주세요.');
            return;
        }
    }
    
    if (!postTitle || !postContent) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }
    
    const newPost = {
        id: Date.now(),
        department: department,
        author: authorName,
        isAnonymous: authorType === 'anonymous',
        title: postTitle,
        content: postContent,
        date: new Date().toLocaleString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        }),
        comments: []
    };
    
    posts.unshift(newPost); // 최신 게시글이 위에 오도록
    savePosts();
    
    // 작성한 과의 커뮤니티로 전환
    switchDepartment(department);
    hideCreateForm();
    
    // 폼 초기화
    document.getElementById('authorName').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

// 게시글 삭제
function deletePost(postId) {
    if (confirm('정말 이 게시글을 삭제하시겠습니까?')) {
        posts = posts.filter(post => post.id !== postId);
        savePosts();
        renderPosts();
    }
}

// 댓글 추가
function addComment(postId, event) {
    event.preventDefault();
    
    const commentAuthorInput = document.getElementById(`commentAuthor_${postId}`);
    const commentContentInput = document.getElementById(`commentContent_${postId}`);
    
    const commentAuthor = commentAuthorInput.value.trim();
    const commentContent = commentContentInput.value.trim();
    
    if (!commentAuthor || !commentContent) {
        alert('작성자와 댓글 내용을 입력해주세요.');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (post) {
        const newComment = {
            id: Date.now(),
            author: commentAuthor,
            content: commentContent,
            date: new Date().toLocaleString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        post.comments.push(newComment);
        savePosts();
        renderPosts();
        
        // 댓글 입력 필드 초기화
        commentAuthorInput.value = '';
        commentContentInput.value = '';
    }
}

// 과별 아이콘 및 이름 매핑
const departmentInfo = {
    'all': { icon: '🌟', name: '전체' },
    'art': { icon: '🎨', name: '미술과' },
    'music': { icon: '🎵', name: '음악과' },
    'dance': { icon: '💃', name: '무용과' }
};

// 게시글 렌더링
function renderPosts() {
    const container = document.getElementById('postsContainer');
    const emptyState = document.getElementById('emptyState');
    const emptyStateMessage = document.getElementById('emptyStateMessage');
    
    // 현재 선택된 과에 맞는 게시글 필터링
    let filteredPosts = posts;
    if (currentDepartment !== 'all') {
        filteredPosts = posts.filter(post => post.department === currentDepartment);
    }
    
    if (filteredPosts.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        const deptInfo = departmentInfo[currentDepartment];
        emptyStateMessage.textContent = `${deptInfo.icon} ${deptInfo.name} 커뮤니티에 아직 게시글이 없습니다. 첫 번째 게시글을 작성해보세요!`;
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredPosts.map(post => {
        const deptInfo = departmentInfo[post.department || 'all'];
        return `
        <div class="post">
            <div class="post-header">
                <div>
                    <div class="post-meta">
                        <span class="post-department">${deptInfo.icon} ${deptInfo.name}</span>
                        <span class="post-author ${post.isAnonymous ? 'anonymous' : ''}">${post.isAnonymous ? '🔒 ' : ''}${escapeHtml(post.author)}</span>
                    </div>
                    <div class="post-date">${post.date}</div>
                </div>
                <button class="btn btn-danger btn-small" onclick="deletePost(${post.id})">삭제</button>
            </div>
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            
            <div class="comments-section">
                <div class="comments-header">💭 댓글 ${post.comments.length > 0 ? `(${post.comments.length})` : ''}</div>
                
                <form class="comment-form" onsubmit="addComment(${post.id}, event)">
                    <input type="text" id="commentAuthor_${post.id}" placeholder="학년-반-번호 또는 이름" required>
                    <textarea id="commentContent_${post.id}" placeholder="댓글을 입력하세요..." required></textarea>
                    <button type="submit" class="btn btn-primary btn-small">💬 댓글 작성</button>
                </form>
                
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">✨ ${escapeHtml(comment.author)}</span>
                                <span class="comment-date">${comment.date}</span>
                            </div>
                            <div class="comment-content">${escapeHtml(comment.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
