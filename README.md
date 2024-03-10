# Cargocraft a.k.a. Kuborossiya

# (Dev) Установка и запуск:
### Экспорт модпака в формат Modrinth
`packwiz modrinth export` - **для PrismLauncher и AstralPrism, AstralRinth и Modrinth App пока не достают по версии Forge**
### Экспорт модпака в формат Curseforge
`packwiz curseforge export`
### Экспорт модпака в формате .zip/prismlauncher/tlauncher/etc.
На данный момент придётся руками загружать `.mrpack` в Prism, а затем экспортировать из него

## Как установить на сервер/обновить?
1. Экспортируем в формат modrinth, .mrpack
2. Устанавливает `mrpack-install`, если его ещё нет
3. `cd <директория проекта>`
4. `mrpack-install --server-dir ./ --server-file <arclight.jar> <путь до .mrpack>`
5. Можно проделать всё то же на локальной машине и скопировать всё из получившейся директории на сервер без замены мира, но с заменой папки `mods`. 



