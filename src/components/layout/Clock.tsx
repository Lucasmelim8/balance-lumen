import { useState, useEffect } from 'react';

/**
 * Um componente que exibe a data e a hora atuais, atualizando a cada segundo.
 * É estilizado com uma fonte monoespaçada clássica e fica oculto em telas pequenas.
 */
const Clock = () => {
  // Estado para armazenar a data e hora atuais
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    // Configura um intervalo para atualizar a hora a cada segundo
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado para evitar vazamentos de memória
    return () => {
      clearInterval(timerId);
    };
  }, []); // O array de dependências vazio garante que este efeito seja executado apenas uma vez na montagem

  // Formata a data e a hora em uma string clássica e legível em português do Brasil
  const formattedDateTime = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(currentDateTime);

  return (
    // O relógio fica oculto em dispositivos móveis (telas menores que 'md') e se torna um container flex em telas maiores.
    // Usa uma fonte monoespaçada para uma aparência de relógio digital clássico.
    <div className="hidden md:flex items-center gap-2 text-sm font-mono text-muted-foreground">
      <span>{formattedDateTime}</span>
    </div>
  );
};

export default Clock;
