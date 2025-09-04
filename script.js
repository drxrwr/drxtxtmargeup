function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

let filesState = [];
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const sortSelect = document.getElementById('sortSelect');
const fileList = document.getElementById('fileList');
const totalLinesEl = document.getElementById('totalLines');
const fileCountEl = document.getElementById('fileCount');
const outputNameEl = document.getElementById('outputName');
const downloadBtn = document.getElementById('downloadBtn');
const prefixToggle = document.getElementById('prefixToggle');

fileInput.addEventListener('change', async (e) => {
  await addFiles([...e.target.files]);
  fileInput.value = '';
});
dropzone.addEventListener('drop', async (e) => {
  e.preventDefault();
  await addFiles([...e.dataTransfer.files]);
});
dropzone.addEventListener('dragover', e => e.preventDefault());
dropzone.addEventListener('click', () => fileInput.click());

async function addFiles(files){
  for (const f of files){
    if (!f.name.endsWith('.txt')) continue;
    const text = await readTextFile(f);
    const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(s=>s);
    filesState.push({id:crypto.randomUUID(), name:f.name, lines});
  }
  render();
}

function render(){
  fileCountEl.textContent = filesState.length;
  totalLinesEl.textContent = filesState.reduce((a,b)=>a+b.lines.length,0);
  fileList.innerHTML = '';
  filesState.forEach(file=>{
    const li=document.createElement('li');
    li.className='file-item'; li.draggable=true; li.dataset.id=file.id;
    li.innerHTML=`<div class="handle">⋮⋮</div>
      <div><div>${file.name}</div><div>${file.lines.length} baris</div></div>`;
    li.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('id', file.id);
    });
    li.addEventListener('dragover', e=>e.preventDefault());
    li.addEventListener('drop', e=>{
      const fromId=e.dataTransfer.getData('id');
      const fromIdx=filesState.findIndex(f=>f.id===fromId);
      const toIdx=filesState.findIndex(f=>f.id===file.id);
      const moved=filesState.splice(fromIdx,1)[0];
      filesState.splice(toIdx,0,moved);
      render();
    });
    fileList.appendChild(li);
  });
}

downloadBtn.addEventListener('click', ()=>{
  let all=[];
  filesState.forEach(f=>{
    const prefix=prefixToggle.checked? f.name.replace(/\\.txt$/,'')+': ' : '';
    f.lines.forEach(line=>all.push(prefix+line));
  });
  const content=all.join("\\n");
  const name=outputNameEl.value.trim()||filesState.reduce((a,b)=>a+b.lines.length,0)+'.txt';
  const blob=new Blob([content],{type:'text/plain'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=name.endsWith('.txt')?name:name+'.txt';
  a.click();
});
