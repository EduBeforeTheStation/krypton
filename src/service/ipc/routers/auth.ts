import { Channel, Route } from '../ipcHandler';

export default class {
  @Channel('test')
  static test(event: Electron.IpcMainEvent, args: any) {
    console.log(args.ping);
    event.sender.send('test', { pong: 'world' });
  }
}