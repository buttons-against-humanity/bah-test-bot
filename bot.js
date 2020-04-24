const socketIOClient = require('socket.io-client');

class Bot {
  socket;

  game_uuid;

  name;

  player_uuid;

  is_czar;

  owner;

  round;

  answers = undefined;

  buttons;

  constructor(logger, name, game_uuid) {
    this.logger = logger;
    this.name = name;
    this.game_uuid = game_uuid;
  }

  connect(uri) {
    this.socket = socketIOClient(uri);
    this.socket.on('connect_error', err => {
      this.logger.error('connect_error error', err);
    });
    this.socket.on('connect', () => {
      this.logger.info(`[${this.name}] connected`);
      setTimeout(() => {
        this.join();
      }, 1000);
    });
    this.socket.on('error:*', message => {
      this.logger.error(message);
      process.exit(1);
    });
    this.socket.on('game:created', game_uuid => {
      this.game_uuid = game_uuid;
    });
    this.socket.on('game:joined', player => {
      this.logger.info(`[${this.name}] Game joined`);
      this.player_uuid = player.uuid;
      this.buttons = player.answers;
    });
    this.socket.on('game:join_error', message => {
      this.logger.error(message);
      process.exit(1);
    });
    this.socket.on('game:players', players => {
      //
    });
    this.socket.on('game:started', () => {
      this.logger.info('Game started');
    });
    this.socket.on('game:owner_change', owner => {
      if (owner.uuid === this.player_uuid) {
        this.owner = true;
        this.logger.info('Now I am the owner!!');
      }
    });
    this.socket.on('game:czar_change', czar => {
      if (czar.uuid === this.player_uuid) {
        this.is_czar = true;
      }
    });
    this.socket.on('game:ended', () => {
      this.logger.info('game ended');
      this.socket.close();
    });
    this.socket.on('player:update', player => {
      console.log('player:update', player);
      this.buttons = player.answers;
    });
    this.socket.on('player:joined', player => {
      console.log('player:joined', player);
    });
    this.socket.on('player:left', player => {
      console.log('player:left', player);
    });
    this.socket.on('round:start', round => {
      console.log('round:start', round);
      if (!round) {
        this.is_czar = false;
        return;
      }
      if (round.card_czar.uuid !== this.player_uuid) {
        setTimeout(() => {
          this.answer(round.question.numAnswers);
        });
      } else {
        this.is_czar = true;
      }
    });
    this.socket.on('round:answers', answers => {
      console.log('round:answers', answers);
      if (this.is_czar) {
        setTimeout(() => {
          this.chooseAnswer(answers);
        }, 1000);
      }
    });
    this.socket.on('round:winner', winner => {
      console.log('round:winner', winner);
    });
  }

  join() {
    const msg = {
      game_uuid: this.game_uuid,
      player_name: this.name
    };
    this.logger.debug('join', msg);
    this.socket.emit('game:join', msg);
  }

  answer(numAnswers) {
    const answers = [];
    for (let i=0;i<numAnswers;i++) {
      answers.push(this.buttons[i]);
    }
    this.socket.emit('round:answer', answers);
  }

  chooseAnswer(answers) {
    this.socket.emit('round:winner', answers[0]);
  }
}

exports.Bot = Bot;
