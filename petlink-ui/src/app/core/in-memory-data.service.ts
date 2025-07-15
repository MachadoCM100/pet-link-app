import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const pets = [
      { id: 1, name: 'Fluffy', type: 'Cat', adopted: false },
      { id: 2, name: 'Rover', type: 'Dog', adopted: true },
      { id: 3, name: 'Nibbles', type: 'Rabbit', adopted: false },
    ];
    return { pets };
  }
}
