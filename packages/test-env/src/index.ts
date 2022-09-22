import shell from "shelljs";

export const startCkbEnv = () => {
  shell.exec(`cd ${__dirname} && docker compose up -d`)
}