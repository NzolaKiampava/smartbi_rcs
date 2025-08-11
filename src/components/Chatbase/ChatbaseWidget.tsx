import { useEffect } from 'react';

declare global {
  interface Window {
    chatbase: any;
  }
}

interface ChatbaseWidgetProps {
  chatbotId?: string;
  domain?: string;
}

const ChatbaseWidget: React.FC<ChatbaseWidgetProps> = ({ 
  chatbotId = "6gRT7yTX40_masF8rCQn7", 
  domain = "www.chatbase.co" 
}) => {
  useEffect(() => {
    const loadChatbase = () => {
      // Verifica se o Chatbase já foi inicializado
      if (!window.chatbase || window.chatbase("getState") !== "initialized") {
        // Inicializa a função chatbase
        window.chatbase = (...args: any[]) => {
          if (!window.chatbase.q) {
            window.chatbase.q = [];
          }
          window.chatbase.q.push(args);
        };

        // Cria um Proxy para o chatbase
        window.chatbase = new Proxy(window.chatbase, {
          get(target: any, prop: string) {
            if (prop === "q") {
              return target.q;
            }
            return (...args: any[]) => target(prop, ...args);
          }
        });
      }

      // Função para carregar o script
      const loadScript = () => {
        // Verifica se o script já foi carregado
        const existingScript = document.getElementById(chatbotId);
        if (existingScript) {
          return; // Script já carregado
        }

        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = chatbotId;
        script.setAttribute('domain', domain);
        script.async = true;
        
        // Adiciona listeners para debug (opcional)
        script.onload = () => {
          console.log('Chatbase carregado com sucesso');
        };
        
        script.onerror = () => {
          console.error('Erro ao carregar o Chatbase');
        };

        document.body.appendChild(script);
      };

      // Carrega o script quando o documento estiver pronto
      if (document.readyState === "complete") {
        loadScript();
      } else {
        const handleLoad = () => {
          loadScript();
          window.removeEventListener("load", handleLoad);
        };
        window.addEventListener("load", handleLoad);
      }
    };

    loadChatbase();

    // Cleanup function
    return () => {
      // Remove o script se necessário (opcional)
      const script = document.getElementById(chatbotId);
      if (script) {
        // Note: Remover o script pode causar problemas, então geralmente é melhor deixá-lo
        // script.remove();
      }
    };
  }, [chatbotId, domain]);

  // Este componente não renderiza nada visível
  return null;
};

export default ChatbaseWidget;