/** Tela de um copo em andamento: o foco do Pomodoro tem tela própria, o café tem a do copo enchendo. */
export const sessionRoute = (active: { pomodoro?: boolean } | null | undefined): '/pomodoro' | '/brew' => (active?.pomodoro ? '/pomodoro' : '/brew');
