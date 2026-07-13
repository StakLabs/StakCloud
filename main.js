let currentProject = 'Main';
let currentUser = null;

const loginOverlay = document.createElement('div');
loginOverlay.id = 'pure-js-login-overlay';
loginOverlay.style.position = 'fixed';
loginOverlay.style.top = '0';
loginOverlay.style.left = '0';
loginOverlay.style.width = '100vw';
loginOverlay.style.height = '100vh';
loginOverlay.style.backgroundColor = '#1e1e24';
loginOverlay.style.color = '#ffffff';
loginOverlay.style.display = 'flex';
loginOverlay.style.flexDirection = 'column';
loginOverlay.style.justifyContent = 'center';
loginOverlay.style.alignItems = 'center';
loginOverlay.style.zIndex = '999999';
loginOverlay.style.fontFamily = 'sans-serif';

const loginTitle = document.createElement('h2');
loginTitle.textContent = 'Login to Codecloud';
loginTitle.style.marginBottom = '20px';

const nameInput = document.createElement('input');
nameInput.type = 'text';
nameInput.placeholder = 'Username';
nameInput.style.padding = '10px';
nameInput.style.marginBottom = '10px';
nameInput.style.width = '250px';
nameInput.style.borderRadius = '4px';
nameInput.style.border = '1px solid #444';
nameInput.style.backgroundColor = '#2d2d34';
nameInput.style.color = '#fff';

const passwordInput = document.createElement('input');
passwordInput.type = 'password';
passwordInput.placeholder = 'Password';
passwordInput.style.padding = '10px';
passwordInput.style.marginBottom = '20px';
passwordInput.style.width = '250px';
passwordInput.style.borderRadius = '4px';
passwordInput.style.border = '1px solid #444';
passwordInput.style.backgroundColor = '#2d2d34';
passwordInput.style.color = '#fff';

const submitBtn = document.createElement('button');
submitBtn.textContent = 'Login';
submitBtn.style.padding = '10px 20px';
submitBtn.style.cursor = 'pointer';
submitBtn.style.borderRadius = '4px';
submitBtn.style.border = 'none';
submitBtn.style.backgroundColor = '#007acc';
submitBtn.style.color = '#fff';
submitBtn.style.fontWeight = 'bold';

loginOverlay.appendChild(loginTitle);
loginOverlay.appendChild(nameInput);
loginOverlay.appendChild(passwordInput);
loginOverlay.appendChild(submitBtn);
document.body.appendChild(loginOverlay);

submitBtn.addEventListener('click', () => {
    const name = nameInput.value;
    const password = passwordInput.value;
    if (name && password) {
        loginUser(name, password);
    } else {
        alert('Please enter both username and password.');
    }
});

async function loginUser(name, password) {
    try {
        const response = await fetch('https://stakcloud.onrender.com/Users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password })
        });
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user.name;
            loginOverlay.remove();
            updateUserCornerSymbol();
            initializeApp();
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
}

function updateUserCornerSymbol() {
    if (!currentUser) return;
    const firstLetter = currentUser.charAt(0).toUpperCase();
    
    let userSymbolElement = document.querySelector('.user-symbol') || 
                            document.querySelector('.profile-icon') || 
                            document.querySelector('.avatar') || 
                            document.querySelector('#userProfile');
                            
    if (userSymbolElement) {
        userSymbolElement.textContent = firstLetter;
    } else {
        const cornerContainer = document.querySelector('header') || 
                                document.querySelector('.sidebar') || 
                                document.querySelector('.nav') || 
                                document.body;
                                
        const newSymbol = document.createElement('div');
        newSymbol.className = 'user-corner-symbol';
        newSymbol.style.position = 'fixed';
        newSymbol.style.top = '15px';
        newSymbol.style.right = '15px';
        newSymbol.style.width = '35px';
        newSymbol.style.height = '35px';
        newSymbol.style.borderRadius = '50%';
        newSymbol.style.backgroundColor = '#007acc';
        newSymbol.style.color = '#fff';
        newSymbol.style.display = 'flex';
        newSymbol.style.justifyContent = 'center';
        newSymbol.style.alignItems = 'center';
        newSymbol.style.fontWeight = 'bold';
        newSymbol.style.fontFamily = 'sans-serif';
        newSymbol.style.zIndex = '99999';
        newSymbol.textContent = firstLetter;
        
        cornerContainer.appendChild(newSymbol);
    }
}

function initializeApp() {
    displayFiles();
    displayProjects();

    const fileCodeInput = document.getElementById('fileCodeInput');
    if (fileCodeInput) {
        fileCodeInput.addEventListener('change', async (event) => {
            displayFiles(fileCodeInput.value);
        });
    }

    const newProjectBtn = document.querySelector('.newProject');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', () => {
            newProject();
        });
    }

    const mainNavElement = document.querySelector('.main-nav');
    if (mainNavElement) {
        mainNavElement.addEventListener('click', () => {
            const activeNav = document.querySelector('.nav-btn.active');
            if (activeNav) activeNav.classList.remove('active');
            mainNavElement.classList.add('active');
            displayFiles();
        });
    }
}

async function getFiles(searched) {
    if (!currentUser) return;
    try {
        const response = await fetch(`https://stakcloud.onrender.com/Files/${searched ? 'code' : 'user'}/${searched ? searched : currentUser}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const files = await response.json();
        const sharedFiles = [];
        try {
            const response = await fetch(`https://stakcloud.onrender.com/Users/${currentUser}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const userInfo = await response.json();
            const codesArray = userInfo.length > 0 && userInfo[0].shared_files
                ? userInfo[0].shared_files.split(',').filter(code => code.trim() !== '')
                : [];
            for (const code of codesArray) {
                try {
                    const response = await fetch(`https://stakcloud.onrender.com/Files/code/${code}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    const file = await response.json();
                    if (file.length > 0) {
                        file.forEach(sharedFile => {
                            sharedFile.isShared = true;
                            sharedFiles.push(sharedFile);
                        });
                    }
                } catch (error) {
                    console.error('Error fetching shared file:', error);
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
        const allFiles = [...files, ...sharedFiles];
        if (allFiles.length === 0) return 'no files';
        return allFiles;
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

async function displayFiles(searched = null, projectName = 'Main') {
    if (addOption) addOption.style.display = searched ? 'block' : 'none';

    let files = await getFiles(searched);
    const grid = document.querySelector('.file-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!files || files.length === 0 || files === 'no files') return;

    let totalStorage = 0;

    if (!searched) {
        for (const file of files) {
            if (!file.isShared) {
                totalStorage += parseFloat(file.storage || 0);
            }
        }

        if (projectName !== 'Main') {
            files = files.filter(file => file.project === projectName);
        }
    }

    for (const file of files) {
        const isReadonly = searched || file.isShared;

        file.type = (file.type || 'unknown').toLowerCase();
        const fileIcon = file.type === 'cs' ? 'C#' : file.type === 'html' ? '🌐' : file.type === 'cpp' ? '➕' : file.type.includes('java') ? '💻' : file.type === 'python' ? '🐍' : file.type === 'css' ? '🎨' : '📄';

        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        fileCard.dataset.name = file.name;
        fileCard.dataset.path = file.path;
        fileCard.dataset.fileName = file.fileName;
        fileCard.dataset.type = file.type;
        fileCard.dataset.code = file.code;

        fileCard.innerHTML = `
            <div class="file-icon">${fileIcon}</div>
            <h4>${file.fileName}</h4>
            <p>${file.type.charAt(0).toUpperCase() + file.type.slice(1)} File (${convertToCorrectData(parseFloat(file.storage || 0))})</p>
            ${!isReadonly ? `<button class="delete-btn" type="button">🗑 Delete</button>` : ''}
        `;

        if (!isReadonly) {
            const deleteBtn = fileCard.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFile(file.name, file.code);
                });
            }
        }

        fileCard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextTarget = {
                name: file.name,
                fileName: file.fileName,
                path: file.path,
                type: file.type,
                storage: file.storage,
                code: file.code,
                project: file.project || 'Main'
            };

            if (deleteOption) deleteOption.style.display = isReadonly ? 'none' : 'block';
            if (contextMenu) {
                contextMenu.style.display = 'block';
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;
            }
        });

        grid.appendChild(fileCard);
    }

    const progressBar = document.querySelector('progress');
    const totalStorageElement = document.querySelector('.total');

    if (progressBar && totalStorageElement && !searched) {
        progressBar.value = totalStorage;
        totalStorageElement.textContent = `${convertToCorrectData(totalStorage)} / 3MB`;
    }
}

async function deleteFile(name, code) {
    try {
        const response = await fetch('https://stakcloud.onrender.com/Files/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, code })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        await response.json();
        displayFiles();
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

async function uploadFile() {
    const file = hiddenInput.files[0];
    if (!file) return;

    const size = file.size;

    try {
        const fileContents = await file.text();
        const fileInfo = {
            name: currentUser,
            type: file.type ? file.type.split('/')[1] : 'unknown',
            path: fileContents,
            uploadedAt: new Date().toISOString(),
            fileName: file.name,
            storage: size,
            code: await shareCode(fileContents),
            project: currentProject !== 'Main' ? currentProject : null
        };

        const response = await fetch('https://stakcloud.onrender.com/Files/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fileInfo)
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        await displayFiles(null, currentProject);
        await displayProjects();
    } catch (error) {
        console.error(error);
    }
}

function convertToCorrectData(size) {
    if (size < 1024) {
        return size + 'B';
    } else if (size < 1048576) {
        return (size / 1024).toFixed(2) + 'KB';
    } else if (size < 1073741824) {
        return (size / 1048576).toFixed(2) + 'MB';
    } else {
        return (size / 1073741824).toFixed(2) + 'GB';
    }
}

let contextTarget = null;
const contextMenu = document.getElementById('fileContextMenu');
const deleteOption = document.getElementById('contextDeleteBtn');
const viewOption = document.getElementById('contextViewBtn');
const hiddenInput = document.getElementById('hiddenFileInput');
const customButton = document.querySelector('.upload');
const shareOption = document.getElementById('contextShareBtn');
const addOption = document.getElementById('contextAddBtn');
const moveOption = document.getElementById('contextMoveBtn');

if (moveOption) {
    moveOption.addEventListener('click', async () => {
        if (!contextTarget) return;
        const newProjectName = prompt("Enter the name of the project to move this file to (caps and grammatical symbols included):");
        const projects = await getProjects();
        if (!newProjectName) return;
        if (newProjectName === contextTarget.project) {
            alert(`The file is already in the project "${newProjectName}".`);
            return;
        } else if (!projects.includes(newProjectName) && (newProjectName !== 'Main' && newProjectName !== 'None')) {
            alert(`Project "${newProjectName}" does not exist.`);
            return;
        }
        const response = await fetch(`https://stakcloud.onrender.com/Files/move/${contextTarget.code}/${newProjectName}`, {
            method: 'PUT'
        });
        if (!response.ok) {
            alert('Failed to move file.');
            return;
        }
        await displayFiles(null, currentProject);
        await displayProjects();
    });
}

if (customButton && hiddenInput) {
    customButton.addEventListener('click', () => {
        hiddenInput.click();
    });

    hiddenInput.addEventListener('change', () => {
        if (hiddenInput.files.length === 0) return;
        uploadFile();
    });
}

document.addEventListener('click', () => {
    if (contextMenu) contextMenu.style.display = 'none';
});

if (deleteOption) {
    deleteOption.addEventListener('click', () => {
        if (contextTarget) {
            deleteFile(contextTarget.name, contextTarget.code);
            contextTarget = null;
        }
        if (contextMenu) contextMenu.style.display = 'none';
    });
}

if (shareOption) {
    shareOption.addEventListener('click', () => {
        if (!contextTarget) return;

        const shareCode = contextTarget.code;
        navigator.clipboard.writeText(shareCode).then(() => {
            alert('Share code copied to clipboard. Share this code to allow others to view the file: ' + shareCode);
        });

        if (contextMenu) contextMenu.style.display = 'none';
    });
}

const escapeHtml = text =>
    Array.isArray(text)
        ? text.map(escapeHtml).join('')
        : String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

if (viewOption) {
    viewOption.addEventListener('click', () => {
        if (!contextTarget) return;

        document.title = `Viewing: ${contextTarget.fileName}`;

        const fileContents = contextTarget.path;
        const mainContainer = document.querySelector('.main');

        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="file-viewer">
                    <h2>Viewing: ${contextTarget.fileName}</h2>
                    <pre>
                    <code class="language-${contextTarget.type}">${escapeHtml(String(fileContents))}</code>
                    </pre>
                </div>
            `;
        }

        if (contextMenu) contextMenu.style.display = 'none';
        if (typeof Prism !== 'undefined') Prism.highlightAll();
    });
}

async function shareCode(file) {
    try {
        let files;
        if (!file) {
            files = await getFiles();
        } else {
            files = Array.isArray(file) ? file : [file];
        }

        const encrypted = encryptData(JSON.stringify(files));
        return encrypted;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function encryptData(code) {
    let hash1 = 5381;
    let hash2 = 52711;

    for (let i = 0; i < code.length; i++) {
        const c = code.charCodeAt(i);

        hash1 = ((hash1 << 5) + hash1) ^ c;
        hash2 = ((hash2 << 5) - hash2) ^ c;
    }

    hash1 >>>= 0;
    hash2 >>>= 0;

    const part1 = hash1.toString(36).padStart(7, '0');
    const part2 = hash2.toString(36).padStart(7, '0');

    return (part1 + part2).slice(0, 15);
}

async function updateSharedFiles(code, name) {
    try {
        const response = await fetch(`https://stakcloud.onrender.com/Users/shared/${code}/${name}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
    } catch (err) {
        console.error(err);
    }
}

if (addOption) {
    addOption.addEventListener('click', async () => {
        if (!contextTarget) return;

        await updateSharedFiles(contextTarget.code, currentUser);

        if (contextMenu) contextMenu.style.display = 'none';
    });
}

async function newProject() {
    const projects = (await getProjects());
    const projectName = prompt("Enter the name of the new project:");
    if (!projectName) return;
    projects.push(projectName);
    alert('Reminder: You will need to upload a file to this project for it to be saved.');
    displayProjects(projectName);
}

async function getProjects() {
    const files = await getFiles();
    if (!files || files.length === 0 || files === 'no files') return [];
    
    const projects = [];
    for (const file of files) {
        if (file.project && file.project !== 'Main' && !projects.includes(file.project)) {
            projects.push(file.project);
        }
    }
    return projects;
}

async function displayProjects(newProjectName = null) {
    const projects = await getProjects();
    if (newProjectName && newProjectName !== 'Main' && !projects.includes(newProjectName)) {
        projects.push(newProjectName);
    } 

    const navContainer = document.querySelector('.projects');
    if (!navContainer) return;
    navContainer.innerHTML = '';

    const mainBtn = document.createElement('button');
    mainBtn.className = `nav-btn main-nav ${currentProject === 'Main' ? 'active' : ''}`;
    mainBtn.textContent = 'Main';
    mainBtn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        mainBtn.classList.add('active');
        currentProject = 'Main';
        displayFiles(null, 'Main');
    });
    navContainer.appendChild(mainBtn);

    for (const project of projects) {
        if (project === 'None') continue;
        const projectBtn = document.createElement('button');
        projectBtn.className = `nav-btn ${currentProject === project ? 'active' : ''}`;
        projectBtn.textContent = (currentProject === project ? '📂 ' : '📁 ') + project;
        
        projectBtn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.includes('📂')) {
                    btn.textContent = btn.textContent.replace('📂', '📁');
                }
            });
            projectBtn.classList.add('active');
            projectBtn.textContent = projectBtn.textContent.replace('📁', '📂');
            currentProject = project;
            displayFiles(null, project);
        });
        navContainer.appendChild(projectBtn);
    }
}

function openProject(projectName) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.textContent === '📁 ' + projectName) {
            btn.classList.add('active');
        }
        btn.textContent = btn.textContent.replace('📁 ', '📂');
    });
    displayByProject(projectName);
}

function displayByProject(projectName) {
    getFiles().then(files => {
        const grid = document.querySelector('.file-grid');
        if (!grid) return;
        
        if (files === 'no files' || !files) {
            grid.innerHTML = '';
            return;
        }
        const correctFiles = files.filter(file => file.project === projectName);
        grid.innerHTML = '';
        for (let file of correctFiles) {
            file.type = (file.type || 'unknown').toLowerCase();
            const fileIcon = file.type === 'cs' ? 'C#' : file.type === 'html' ? '🌐' : file.type === 'cpp' ? '➕' : file.type.includes('java') ? '💻' : file.type === 'python' ? '🐍' : file.type === 'css' ? '🎨' : '📄';
            
            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            fileCard.dataset.name = file.name;
            fileCard.dataset.path = file.path;
            fileCard.dataset.fileName = file.fileName;
            fileCard.dataset.type = file.type;
            fileCard.dataset.code = file.code;
            
            fileCard.innerHTML = `
                <div class="file-icon">${fileIcon}</div>
                <h4>${file.fileName}</h4>
                <p>${file.type.charAt(0).toUpperCase() + file.type.slice(1)} File (${convertToCorrectData(parseFloat(file.storage))})</p>
                ${`<button class="delete-btn" type="button">🗑 Delete</button>`}
            `;
            grid.appendChild(fileCard);
        }
    });
}