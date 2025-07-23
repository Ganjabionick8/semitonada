const notas = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

const campos = {
  maior: {
    intervalos: [0, 2, 4, 5, 7, 9, 11],
    sufixos: ["", "m", "m", "", "", "m", "°"]
  },
  menor: {
    intervalos: [0, 2, 3, 5, 7, 8, 10],
    sufixos: ["m", "°", "", "m", "m", "", ""]
  }
};

let modoAtual = 'maior';
let tomAtual = 'C';
let acordeAtual = 0;

const tonsDiv = document.getElementById("tons");
const acordesDiv = document.getElementById("acordes");
const metaDiv = document.getElementById("meta");
const toggleBtn = document.getElementById("toggleModo");
const btnGeral = document.getElementById("btnGeral");
const btnIndividual = document.getElementById("btnIndividual");
const btnResetIndividual = document.getElementById("btnResetIndividual");
const btnToggleTeoria = document.getElementById("btnToggleTeoria");
const teoriaDiv = document.getElementById("teoria");
const tabs = document.querySelectorAll('.tabs button');
const btnPix = document.getElementById("btnPix");

function setModoTexto() {
  toggleBtn.textContent = `Modo: ${modoAtual === 'maior' ? 'Maior' : 'Menor'}`;
  toggleBtn.setAttribute('aria-pressed', modoAtual === 'menor');
}

function ativarBotaoTom(nota) {
  document.querySelectorAll('#tons button').forEach(b => b.classList.remove('ativo'));
  const btn = [...tonsDiv.children].find(b => b.textContent === nota);
  if (btn) btn.classList.add('ativo');
}

function limpar() {
  acordesDiv.innerHTML = '';
  metaDiv.textContent = '';
  btnResetIndividual.style.display = 'none';
}

function gerarCampo(tom, modo) {
  const idx = notas.indexOf(tom);
  const { intervalos, sufixos } = campos[modo];
  return intervalos.map((intv, i) => {
    const nota = notas[(idx + intv) % 12];
    return nota + sufixos[i];
  });
}

function mostrarTodos() {
  const campo = gerarCampo(tomAtual, modoAtual);
  acordesDiv.innerHTML = '';
  campo.forEach(ac => {
    const div = document.createElement("div");
    div.textContent = ac;
    acordesDiv.appendChild(div);
  });
  metaDiv.textContent = `Campo harmônico de ${tomAtual} (${modoAtual})`;
  btnResetIndividual.style.display = 'none';
}

function modoIndividual() {
  const campo = gerarCampo(tomAtual, modoAtual);
  acordesDiv.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const div = document.createElement("div");
    div.textContent = i === 0 ? campo[0] : "●";
    if (i !== 0) div.setAttribute("data-fechado", "true");
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-pressed', div.textContent !== "●");
    div.onclick = () => {
      if (div.textContent === "●") {
        div.textContent = campo[i];
        div.removeAttribute("data-fechado");
        div.setAttribute('aria-pressed', "true");
        atualizarMeta();
      }
    };
    acordesDiv.appendChild(div);
  }
  acordeAtual = 1;
  atualizarMeta();
  btnResetIndividual.style.display = 'inline-block';
}

function resetarIndividual() {
  modoIndividual();
}

function atualizarMeta() {
  const mostrados = [...acordesDiv.children].filter(d => d.textContent !== "●").length;
  metaDiv.textContent = `Progresso: ${mostrados}/7`;
}

function alternarModo() {
  modoAtual = modoAtual === 'maior' ? 'menor' : 'maior';
  setModoTexto();
  limpar();
}

function toggleTeoria() {
  const isHidden = teoriaDiv.style.display === "none" || teoriaDiv.style.display === "";
  teoriaDiv.style.display = isHidden ? "block" : "none";
  btnToggleTeoria.setAttribute('aria-expanded', isHidden);
}

function mostrarAba(nome) {
  const abas = document.querySelectorAll('.aba');
  abas.forEach(aba => aba.style.display = 'none');
  document.getElementById(`aba-${nome}`).style.display = 'block';

  tabs.forEach(btn => {
    btn.classList.remove('ativo');
    btn.setAttribute('aria-selected', 'false');
    btn.tabIndex = -1;
  });
  const btn = document.getElementById(`tab-${nome}`);
  btn.classList.add('ativo');
  btn.setAttribute('aria-selected', 'true');
  btn.tabIndex = 0;
  btn.focus();
}

function copiarPix() {
  const chave = btnPix.getAttribute("data-pix");
  navigator.clipboard.writeText(chave).then(() => {
    const c = document.getElementById("confirmacaoPix");
    c.style.display = 'block';
    setTimeout(() => {
      c.style.display = 'none';
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  notas.forEach(nota => {
    const btn = document.createElement("button");
    btn.textContent = nota;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      tomAtual = nota;
      acordeAtual = 0;
      ativarBotaoTom(nota);
      limpar();
    });
    tonsDiv.appendChild(btn);
  });

  ativarBotaoTom(tomAtual);
  setModoTexto();
  mostrarAba('geral');

  toggleBtn.addEventListener('click', alternarModo);
  btnGeral.addEventListener('click', mostrarTodos);
  btnIndividual.addEventListener('click', modoIndividual);
  btnResetIndividual.addEventListener('click', resetarIndividual);
  btnToggleTeoria.addEventListener('click', toggleTeoria);
  tabs.forEach(tab => tab.addEventListener('click', () => mostrarAba(tab.id.replace('tab-', ''))));
  btnPix.addEventListener('click', copiarPix);
});
