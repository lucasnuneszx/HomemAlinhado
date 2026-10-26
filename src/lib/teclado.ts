import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform, type KeyboardEvent } from 'react-native';

/**
 * Altura do teclado, acompanhando a animação dele.
 *
 * Existe porque o KeyboardAvoidingView erra a conta dentro de modal no iOS:
 * ele mede a tela a partir do topo da janela, não da folha, e o botão do
 * rodapé fica escondido atrás do teclado.
 */
export function useAlturaTeclado(): number {
  const [altura, setAltura] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';

    function animar(e: KeyboardEvent) {
      if (!ios) return;
      LayoutAnimation.configureNext(
        LayoutAnimation.create(e.duration || 250, LayoutAnimation.Types.keyboard, LayoutAnimation.Properties.opacity),
      );
    }

    const mostrar = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
      animar(e);
      setAltura(e.endCoordinates.height);
    });
    const esconder = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', (e) => {
      animar(e);
      setAltura(0);
    });

    return () => {
      mostrar.remove();
      esconder.remove();
    };
  }, []);

  return altura;
}
