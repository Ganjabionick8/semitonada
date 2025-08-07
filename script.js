// --- Dados base das notas ---
const notasSustenido = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notasBemol = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

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

// --- Estado global ---
let modoAtual = 'maior';
let tomAtual = 'C';
let acordeAtual = 0;
let useBemol = false;
let animacaoAtiva = false;
let timerId;
let quizAtivo = false;

// --- Elementos DOM ---
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

// Novos botões
const btnToggleNotas = document.createElement('button');
btnToggleNotas.id = "btnToggleNotas";
btnToggleNotas.type = 'button';
btnToggleNotas.setAttribute('aria-pressed', 'false');
btnToggleNotas.textContent = "Exibir bemóis";
btnToggleNotas.style.marginLeft = "1rem";
document.querySelector('.modo-toggle').appendChild(btnToggleNotas);

const toggleAnimacaoBtn = document.createElement('button');
toggleAnimacaoBtn.id = "btnAnimacao";
toggleAnimacaoBtn.type = 'button';
toggleAnimacaoBtn.textContent = "Iniciar Progressão";
toggleAnimacaoBtn.style.marginLeft = "1rem";
document.querySelector('.modo-toggle').appendChild(toggleAnimacaoBtn);

const btnQuiz = document.createElement('button');
btnQuiz.id = "btnQuiz";
btnQuiz.type = 'button';
btnQuiz.textContent = "Modo Treino (Quiz)";
btnQuiz.style.marginLeft = "1rem";
document.querySelector('.modo-toggle').appendChild(btnQuiz);

const graus = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

const quizDiv = document.createElement('div');
quizDiv.style.marginTop = '1rem';

// --- Funções base ---

function getNotas() {
  return useBemol ? notasBemol : notasSustenido;
}

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
  pararAnimacao();
  pararQuiz();
  if (quizDiv.parentNode === acordesDiv) acordesDiv.removeChild(quizDiv);
}

function gerarCampo(tom, modo) {
  const notas = getNotas();
  const idx = notas.indexOf(tom);
  const { intervalos, sufixos } = campos[modo];
  return intervalos.map((intv, i) => {
    const nota = notas[(idx + intv) % 12];
    return nota + sufixos[i];
  });
}

// --- Exibir todos os acordes ---
function mostrarTodos() {
  limpar();
  const campo = gerarCampo(tomAtual, modoAtual);
  campo.forEach(ac => {
    const div = document.createElement("div");
    div.textContent = ac;
    acordesDiv.appendChild(div);
  });
  metaDiv.textContent = `Campo harmônico de ${tomAtual} (${modoAtual})`;
}

// --- Modo individual ---
function modoIndividual() {
  limpar();
  const campo = gerarCampo(tomAtual, modoAtual);
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
  btnResetIndividual.style.display = 'inline-block';
  atualizarMeta();
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

// --- Função para alternar exibição de notas com bemol/sustenido ---
function toggleNotas() {
  useBemol = !useBemol;
  ativarBotaoTom(tomAtual);
  limpar();
  mostrarTodos();
}

// --- Função da progressão animada ---
function animarProgressao() {
  if (animacaoAtiva) {
    pararAnimacao();
    return;
  }
  animacaoAtiva = true;
  toggleAnimacaoBtn.textContent = "Parar Progressão";
  limpar();

  const campo = gerarCampo(tomAtual, modoAtual);
  let i = 0;

  function mostrarProximo() {
    if (!animacaoAtiva) return;
    acordesDiv.innerHTML = '';
    for (let j = 0; j < campo.length; j++) {
      const div = document.createElement("div");
      div.textContent = j === i ? campo[j] : "●";
      acordesDiv.appendChild(div);
    }
    i++;
    if (i < campo.length) {
      timerId = setTimeout(mostrarProximo, 1000);
    } else {
      animacaoAtiva = false;
      toggleAnimacaoBtn.textContent = "Iniciar Progressão";
      mostrarTodos();
    }
  }

  mostrarProximo();
}

function pararAnimacao() {
  animacaoAtiva = false;
  clearTimeout(timerId);
  toggleAnimacaoBtn.textContent = "Iniciar Progressão";
}

// --- Funções do quiz ---

function iniciarQuiz() {
  quizAtivo = true;
  limpar();
  metaDiv.textContent = 'Treino: identifique a nota correta do grau mostrado.';
  acordesDiv.appendChild(quizDiv);
  proximoQuiz();
}

function proximoQuiz() {
  if (!quizAtivo) return;

  const campo = gerarCampo(tomAtual, modoAtual);
  const idx = Math.floor(Math.random() * 7);
  const grau = graus[idx];
  const respostaCorreta = campo[idx];

  quizDiv.innerHTML = `<p>Qual é a nota do grau <strong>${grau}</strong>?</p>`;

  const opcoes = new Set();
  opcoes.add(respostaCorreta);

  while (opcoes.size < 4) {
    const notaFalsa = campo[Math.floor(Math.random() * 7)];
    opcoes.add(notaFalsa);
  }

  const opcoesArray = Array.from(opcoes);
  shuffleArray(opcoesArray);

  opcoesArray.forEach(opcao => {
    const btn = document.createElement('button');
    btn.textContent = opcao;
    btn.type = 'button';
    btn.style.margin = '0.3rem';
    btn.addEventListener('click', () => {
      if (!quizAtivo) return;
      if (opcao === respostaCorreta) {
        alert('Acertou! 🎉');
      } else {
        alert(`Errou! A resposta correta é ${respostaCorreta}.`);
      }
      proximoQuiz();
    });
    quizDiv.appendChild(btn);
  });
}

function pararQuiz() {
  quizAtivo = false;
  quizDiv.innerHTML = '';
  if (quizDiv.parentNode === acordesDiv) acordesDiv.removeChild(quizDiv);
  metaDiv.textContent = '';
  mostrarTodos();
}

// Função utilitária para embaralhar array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// --- Eventos e inicialização ---

document.addEventListener('DOMContentLoaded', () => {
  // Criar botões dos tons
  getNotas().forEach(nota => {
    const btn = document.createElement("button");
    btn.textContent = nota;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      tomAtual = nota;
      acordeAtual = 0;
      ativarBotaoTom(nota);
      limpar();
      mostrarTodos();
    });
    tonsDiv.appendChild(btn);
  });

  ativarBotaoTom(tomAtual);
  setModoTexto();
  mostrarAba('geral');
  mostrarTodos();

  toggleBtn.addEventListener('click', () => {
    alternarModo();
    mostrarTodos();
  });
  btnGeral.addEventListener('click', mostrarTodos);
  btnIndividual.addEventListener('click', modoIndividual);
  btnResetIndividual.addEventListener('click', resetarIndividual);
  btnToggleTeoria.addEventListener('click', toggleTeoria);
  tabs.forEach(tab => tab.addEventListener('click', () => mostrarAba(tab.id.replace('tab-', ''))));
  btnPix.addEventListener('click', copiarPix);

  btnToggleNotas.addEventListener('click', () => {
    toggleNotas();
    btnToggleNotas.setAttribute('aria-pressed', useBemol);
    btnToggleNotas.textContent = useBemol ? 'Exibir sustenidos' : 'Exibir bemóis';
  });

  toggleAnimacaoBtn.addEventListener('click', animarProgressao);

  btnQuiz.addEventListener('click', () => {
    if (!quizAtivo) {
      iniciarQuiz();
      btnQuiz.textContent = "Sair do Quiz";
    } else {
      pararQuiz();
      btnQuiz.textContent = "Modo Treino (Quiz)";
    }
  });
});
