/**
 * Class to interact with Powercord through Discord's RPC WebSocket server.
 * @link https://gist.github.com/Bowser65/5756e490860aa122f5ad13f5cf19fd7d
 * @author Bowser65
 * @licence MIT
 */
class PowercordRPC {
  get ws () {
    return this._ws;
  }

  set ws (ws) {
    // Prevents multiple alive WebSockets
    if (this._ws) {
      this._ws.close();
    }
    this._ws = ws;
  }

  /**
   * Checks if there is an available Powercord-decorated RPC server.
   * @returns {Promise<boolean>}
   */
  async isRPCAvailable () {
    if (this.ws) {
      return true;
    }

    try {
      await this._connect();
      return true;
    } catch (ignored) {
      return false;
    }
  }

  /**
   * Opens Powercord's store page for a given entity.
   * @param type {String} Type of entity.
   * @param id {String} Plugin ID.
   * @returns {Promise<object>}
   */
  installEntity (type, id) {
    if (![ 'plugin', 'theme' ].includes(type)) {
      throw new Error('Invalid entity type');
    }
    return this.sendRaw('POWERCORD_OPEN_STORE', {
      type,
      id
    });
  }

  /**
   * Open settings for a given entity.
   * @param type {String} Type of entity.
   * @param id {String} Plugin ID.
   * @returns {Promise<object>}
   */
  openEntitySettings (type, id) {
    if (![ 'plugin', 'theme' ].includes(type)) {
      throw new Error('Invalid entity type');
    }
    return this.sendRaw('POWERCORD_OPEN_SETTINGS', {
      type,
      id
    });
  }

  /**
   * Sends a message to Discord's RPC server
   * @param event {String} Name of the event
   * @param args {object} Data to send
   * @returns {Promise<object>}
   */
  sendRaw (event, args) {
    return new Promise(async (resolve, reject) => {
      if (!this.ws) {
        try {
          await this._connect();
        } catch (e) {
          reject(e);
          return;
        }
      }

      const nonce = this._v4();
      this._callbacks[nonce] = resolve;
      this.ws.send(JSON.stringify({
        cmd: event,
        args,
        nonce
      }));
    });
  }

  /**
   * Connects to Discord's RPC WebSocket
   * @returns {Promise<WebSocket>}
   * @private
   */
  _connect (portInc = 0) {
    const port = PowercordRPC.RPC_STARTING_PORT + portInc;
    this._log('Attempting to connect on port', port);
    return new Promise(async (resolve, reject) => {
      this._callbacks = {};
      this._ready = false;
      try {
        // DISCOVERY
        const res = await fetch(`http://127.0.0.1:${port}/powercord`);
        if (res.ok) {
          const data = await res.json();
          if (data.code === 69) {
            this._log('Discovered Powercord on port', port);
            this.metadata = {
              powercord: data.powercord,
              plugins: data.plugins,
              themes: data.themes
            };
          } else {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Discovery failed');
          }
        } else {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Discovery failed');
        }

        // CONNECTING
        this.ws = new WebSocket(`ws://127.0.0.1:${port}/?v=${PowercordRPC.RPC_VERSION}&client_id=powercord`);
        this.ws.addEventListener('message', msg => {
          const data = JSON.parse(msg.data);
          if (!this._ready && data.cmd === 'DISPATCH' && data.evt === 'READY') {
            this._log('Connection successful');
            this._ready = true;
            resolve();
          } else if (this._ready) {
            const callback = this._callbacks[data.nonce];
            if (callback) {
              return callback(data.data);
            }
          }
        });
        this.ws.addEventListener('close', (e) => {
          this._log('Connection closed.', e.code, e.reason || 'Unknown', e.wasClean);
          Object.values(this._callbacks).forEach(cb => cb());
          this.ws = null;
        });
      } catch (e) {
        this._log('Connection failed.');
        if (portInc++ === PowercordRPC.RPC_PORT_RANGE) {
          reject(new Error('No available RPC'));
        }
        this._connect(portInc).then(resolve).catch(reject);
      }
    });
  }

  /**
   * Genrates a random UUID v4
   * @returns {string} Generated UUID
   * @private
   */
  _v4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  _log (...args) {
    console.log('%c[PowercordRPC]', 'color: #7289da', ...args);
  }
}

PowercordRPC.RPC_STARTING_PORT = 6463;
PowercordRPC.RPC_PORT_RANGE = 10;
PowercordRPC.RPC_VERSION = 1;
