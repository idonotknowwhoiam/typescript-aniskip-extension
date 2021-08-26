import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { SkipButtonContainer } from '../../components';
import { Store } from '../../data';
import { Player } from '../../players/base-player.types';
import { PlayerProvider } from '../../utils';
import { BaseRenderer } from '../base-renderer';

export class SkipButtonsRenderer extends BaseRenderer {
  variant: string;

  store: Store;

  player: Player;

  constructor(id: string, variant: string, store: Store, player: Player) {
    super(id, [
      'keydown',
      'keyup',
      'mousedown',
      'mouseup',
      'click',
      'touchstart',
      'touchend',
    ]);

    this.variant = variant;
    this.store = store;
    this.player = player;
  }

  render(): void {
    ReactDOM.render(
      <Provider store={this.store}>
        <PlayerProvider value={this.player}>
          <SkipButtonContainer variant={this.variant} />
        </PlayerProvider>
      </Provider>,
      this.shadowRoot.getElementById(this.reactRootId)
    );
  }
}
