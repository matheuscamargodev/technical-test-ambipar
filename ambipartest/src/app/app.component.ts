import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ambipartest';
  selectedFile: any = null;
  logText: any;
  textField: any;
  outputLog: any;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.logText = fileReader.result;
      this.extractInfo(this.logText);
    };
    fileReader.readAsText(this.selectedFile);
  }

  limpar() {
   window.location.reload();
  }

  alteraCampo(event: any) {
    if (event.target.value.length < 100) {
      event.target.value = '';
      return alert('Não parece ser um log válido.');
    } else {
      this.logText = event.target.value;
      this.extractInfo(this.logText);
    }
  }

  extractInfo(log: any) {
    let totalDamageHealed: any = 0;
    let totalDamageTaken: any = 0;
    let totalBlackKnightHealth: any = 0;
    let damageTakenPerCreatureKind: any = {};
    let totalExperienceReceived: any = 0;

    let loot: any = {};

    let logLines = log.split('\n');

    for (let line of logLines) {
      const damageHealedMatch = line.match(
        /You healed yourself for ([0-9]+) hitpoints/
      );
      const damageTakenMatch = line.match(/You lose ([0-9]+) hitpoints/);
      const damageTakenByCreatureMatch = line.match(
        /You lose ([0-9]+) hitpoints due to an attack by a ([\w\s]+)\./
      );
      const blackKnightHealth = line.match(
        /A Black Knight loses ([0-9]+) hitpoints/
      );
      const experienceReceivedMatch = line.match(
        /You gained ([0-9]+) experience points/
      );
      const itemDroppedMatch = line.match(/Loot of a \w+: (.*)\./);
      if (blackKnightHealth) {
        totalBlackKnightHealth += parseInt(blackKnightHealth[1]);
      }

      if (damageTakenByCreatureMatch) {
        const creatureKind = damageTakenByCreatureMatch[2];
        const damageTaken = parseInt(damageTakenByCreatureMatch[1]);
        if (damageTakenPerCreatureKind[creatureKind]) {
          damageTakenPerCreatureKind[creatureKind] += damageTaken;
        } else {
          damageTakenPerCreatureKind[creatureKind] = damageTaken;
        }
      }
      if (itemDroppedMatch) {
        const items = itemDroppedMatch[1].split(', ');
        for (const item of items) {
          if (loot[item]) {
            loot[item] += 1;
          } else {
            loot[item] = 1;
          }
        }
      }
      if (damageHealedMatch) {
        totalDamageHealed += parseInt(damageHealedMatch[1]);
      } else if (damageTakenMatch) {
        totalDamageTaken += parseInt(damageTakenMatch[1]);
      } else if (experienceReceivedMatch) {
        totalExperienceReceived += parseInt(experienceReceivedMatch[1]);
      }
    }
    // Imprimir as informações extraídas

    let output: any = { damageTaken: {} };

    output.hitpointsHealed = totalDamageHealed;
    output.damageTaken.total = totalDamageTaken;
    output.damageTaken.byCreatureKind = damageTakenPerCreatureKind;
    output.experienceGained = totalExperienceReceived;
    output.blackKnightHealth = totalBlackKnightHealth;
    output.loot = this.simplificarLoot(loot);

    let damageTotalPerKind: any = 0;

    for (let creature of Object.values(damageTakenPerCreatureKind)) {
      damageTotalPerKind += creature;
    }

    output.unknownDamage = output.damageTaken.total - damageTotalPerKind;
    this.outputLog = output;
  }

  simplificarLoot(loot: any) {
    const groupedLoot: any = {};

    for (const item in loot) {
      const itemName = item.replace(/^\d+\s/, ''); // Remove o número no início do nome do item

      groupedLoot[itemName] = (groupedLoot[itemName] || 0) + loot[item];
    }
    return groupedLoot;
  }
}
