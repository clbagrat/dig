/**
 * Конфигурация магазина прокачки.
 *
 * Структура:
 *   SHOP_TREES — массив деревьев прокачки.
 *
 * Каждое дерево:
 *   id       — уникальный строковый идентификатор
 *   name     — отображаемое название
 *   icon     — символ/emoji для таба
 *   nodes    — массив узлов дерева
 *
 * Каждый узел:
 *   id       — уникальный строковый идентификатор
 *   name     — отображаемое название
 *   icon     — символ/emoji
 *   desc     — описание эффекта одного уровня
 *   maxLevel — максимальный уровень (1 = разовая покупка)
 *   costs    — массив цен в золотое по уровням (length == maxLevel)
 *   row      — строка в сетке дерева (0 = верхний ряд)
 *   col      — столбец в сетке дерева (0 = левый)
 *   requires — id узла-родителя (null = корневой узел)
 *
 * Чтобы следующий уровень стал доступен, предыдущий должен быть куплен хотя бы на 1.
 * Чтобы дочерний узел (requires) стал доступен, родитель должен быть хотя бы на уровне 1.
 */

export const SHOP_TREES = [
  {
    id: "drilling",
    name: "Бурение",
    icon: "⛏",
    nodes: [
      {
        id: "drill_power",
        name: "Мощность бура",
        icon: "D",
        desc: "+0.5 к силе удара за уровень",
        maxLevel: 3,
        costs: [40, 80, 150],
        row: 0,
        col: 1,
        requires: null,
      },
      {
        id: "side_drills",
        name: "Боковые буры",
        icon: "⫼",
        desc: "Каждый удар бьёт боковые клетки",
        maxLevel: 2,
        costs: [60, 130],
        row: 1,
        col: 0,
        requires: "drill_power",
      },
      {
        id: "long_drill",
        name: "Длинный бур",
        icon: "⇢",
        desc: "+20% урон по следующему тайлу вперёд",
        maxLevel: 3,
        costs: [60, 110, 180],
        row: 1,
        col: 1,
        requires: "drill_power",
      },
      {
        id: "diagonal_drills",
        name: "Диагональные буры",
        icon: "✣",
        desc: "+20% урон по двум диагоналям вперёд",
        maxLevel: 3,
        costs: [60, 110, 180],
        row: 1,
        col: 2,
        requires: "drill_power",
      },
      {
        id: "sapper_charge",
        name: "Саперный заряд",
        icon: "✦",
        desc: "Каждые 15 блоков бросает ракету на дистанцию 3",
        maxLevel: 3,
        costs: [90, 160, 250],
        row: 2,
        col: 1,
        requires: "long_drill",
      },
    ],
  },

  {
    id: "fuel",
    name: "Топливо",
    icon: "⛽",
    nodes: [
      {
        id: "fuel_tank",
        name: "Расширенный бак",
        icon: "◌",
        desc: "+60 к максимуму топлива",
        maxLevel: 3,
        costs: [35, 70, 120],
        row: 0,
        col: 1,
        requires: null,
      },
      {
        id: "fuel_circuit",
        name: "Топливный контур",
        icon: "⛽",
        desc: "Каждый тайловый перк даёт +50 топлива",
        maxLevel: 1,
        costs: [80],
        row: 1,
        col: 0,
        requires: "fuel_tank",
      },
      {
        id: "recirculator",
        name: "Рециркулятор",
        icon: "●",
        desc: "+2 золота и +2 топлива за каждый разрушенный блок",
        maxLevel: 2,
        costs: [80, 150],
        row: 1,
        col: 1,
        requires: "fuel_tank",
      },
      {
        id: "low_fuel_boost",
        name: "Форсаж на нуле",
        icon: "⏚",
        desc: "Чем меньше топлива, тем быстрее следующий удар",
        maxLevel: 3,
        costs: [70, 130, 200],
        row: 1,
        col: 2,
        requires: "fuel_tank",
      },
      {
        id: "overload",
        name: "Перегрузка",
        icon: "⚡",
        desc: "Переполнение топлива даёт форсаж, затем взрыв и оглушение",
        maxLevel: 1,
        costs: [120],
        row: 2,
        col: 1,
        requires: "recirculator",
      },
    ],
  },

  {
    id: "vision",
    name: "Обзор",
    icon: "◉",
    nodes: [
      {
        id: "geo_lens",
        name: "Гео-линза",
        icon: "◉",
        desc: "+2 к радиусу обзора",
        maxLevel: 2,
        costs: [60, 130],
        row: 0,
        col: 0,
        requires: null,
      },
      {
        id: "radar_module",
        name: "Радарный модуль",
        icon: "⌖",
        desc: "Радар показывает ближайшие кристаллы",
        maxLevel: 1,
        costs: [80],
        row: 0,
        col: 1,
        requires: null,
      },
      {
        id: "radar_booster",
        name: "Усилитель радара",
        icon: "R",
        desc: "+2 заряда радара при каждом получении",
        maxLevel: 3,
        costs: [50, 100, 160],
        row: 1,
        col: 0,
        requires: "geo_lens",
      },
    ],
  },
];
