import { Telegraf } from 'telegraf';
import { IncomingMessage } from 'telegraf/typings/telegram-types';
import Planner from 'async-delay-planner';
import { botToken } from './config';

const planner = new Planner(500, 60000);

interface Dice {
  emoji: string;
  value: number
}

const bot = new Telegraf(botToken);

const maxValues: {
  [emoji: string]: number;
} = {
  '🎯': 6,
  '🎰': 64,
  '⚽': 5,
  '🏀': 5,
  '🎲': 6,
};

bot.start((ctx) => {
  ctx.reply('Приветули, отправь боту один из эмоджи: 🎯🎰⚽🏀🎲', {
    // reply_markup: { keyboard: [
    //   [{text: '🎯'},]
    // ] }
  })
});

bot.on('message', async (ctx) => {
  const message: IncomingMessage = ctx.update?.message as IncomingMessage;
  if (message?.dice) {
    console.log(message.from?.first_name, message.from?.username, message.dice); // tslint:disable-line no-console
    await new Promise(rs => setTimeout(rs, 5000));
    await planner.hold();
    const dice: Dice = message.dice as Dice;
    const emoji = dice.emoji;
    const max = maxValues[emoji];
    if (!max) {
      ctx.reply('У! Новый дайс! Я такой не знаю!');
      return;
    }
    const luck = dice.value / max;
    let text: string[];
    if (dice.value === 1) {
      text = ['Неудача Вас постигла, сэр', 'Ебаный рот этого казино, блядь! Ты кто такой, сука!'];
    } else if (luck <= 1/4) {
      text = ['Мы верим в Вас', 'Не самый плохой результат, но почти))', 'Следующий раз точно должен быть лучше'];
    } else if (luck <= 1/2) {
      text = ['Штош, пробуйте дальше', 'Средненько, ещё раз?'];
    } else if (luck >= 1) {
      text = ['Уоу! Все боты хотят от Вас детей!', 'Ух ты, джекпот!', 'Лучший из лучших, бро'];
    } else {
      text = ['Вы хорошо себя показали, сэр. Но немного постарайтесь и сделайте идеально', 'Немного не хватило до идеала'];
    }
    ctx.reply(text[Math.floor(text.length * Math.random())] + ' (' + dice.value + ' из ' + max + ')', { reply_to_message_id: message.message_id });
  }
});

bot.startPolling();
