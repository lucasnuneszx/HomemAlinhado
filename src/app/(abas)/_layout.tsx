import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Cores } from '@/constants/tema';

/** Abas nativas do iOS. Sem cor: branco sobre preto, com SF Symbols. */
export default function Abas() {
  return (
    <NativeTabs
      backgroundColor={Cores.preto}
      tintColor={Cores.branco}
      labelStyle={{ color: Cores.cinza1, selected: { color: Cores.branco } }}>
      <NativeTabs.Trigger name="hoje">
        <NativeTabs.Trigger.Label>Hoje</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.circle" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="indice">
        <NativeTabs.Trigger.Label>Índice</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="grupo">
        <NativeTabs.Trigger.Label>Grupo</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inventario">
        <NativeTabs.Trigger.Label>Inventário</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="square.grid.2x2" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="perfil">
        <NativeTabs.Trigger.Label>Perfil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
