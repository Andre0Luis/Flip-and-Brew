#!/usr/bin/env bash
# Valida assuntos de commit no padrão Conventional Commits (ADR-0026).
# Lê um assunto por linha na entrada padrão; imprime os que violam a regra e sai com 1 se houver algum.
#
#   tipo(escopo)!: descrição        escopo e ! são opcionais
#   - tipo: feat fix docs style refactor perf test build ci chore revert
#   - descrição em minúscula, sem ponto final, e o assunto inteiro com até 72 caracteres
set -u
re='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._/-]+\))?!?: [[:lower:][:digit:]`].*$'
bad=0
while IFS= read -r subject; do
  [ -z "$subject" ] && continue
  case "$subject" in 'Revert "'*) continue ;; esac # o botão "Revert" do GitHub
  if [[ ! $subject =~ $re ]]; then
    echo "x fora do padrão: $subject"; bad=1
  elif [ "${#subject}" -gt 72 ]; then
    echo "x passa de 72 caracteres (${#subject}): $subject"; bad=1
  elif [[ $subject == *. ]]; then
    echo "x termina com ponto: $subject"; bad=1
  fi
done
exit $bad
