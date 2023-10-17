import { Task } from "@prisma/client";
import { pickTasks } from "./pickTasks"
import { v4 as uuid } from "uuid";

// mock shuffle so we get deterministic test results
jest.mock('lodash.shuffle', () => {
  return (xs: any[]) => xs;
});

const task = (data: Partial<Task> = {}) => ({
  id: uuid(),
  name: 'test task',
  important: false,
  urgent: false,
  someday: false,
  userId: 'foobar',
  completed: false,
  archived: false,
  description: 'foo',
  createdAt: new Date(),
  ...data
});

describe('./pickTasks', () => {
  describe('#pickTasks()', () => {
    it('should pick `limit` tasks from the list', () => {
      const picked = pickTasks(
        [task(), task(), task()],
        { limit: 2 }
      );
      expect(picked.length).toBe(2);
    });

    it('should pick `important` and `urgent` tasks first', () => {
      const tasks = [
        task({ urgent: true }),
        task({ important: true }),
        task({ important: true, urgent: true }),
      ];
      const picked = pickTasks(tasks, { limit: 1 });
      expect(picked[0].id).toBe(tasks[2].id);
    });

    it('should pick `urgent` tasks before `important` tasks', () => {
      const tasks = [
        task({ important: true }),
        task({ urgent: true }),
      ];
      const picked = pickTasks(tasks, { limit: 1 });
      expect(picked[0].id).toBe(tasks[1].id);
    });

    it('should pick `important` tasks before `normal` tasks', () => {
      const tasks = [
        task(),
        task({ important: true }),
      ];
      const picked = pickTasks(tasks, { limit: 1 });
      expect(picked[0].id).toBe(tasks[1].id);
    });

    it('should pick `normal` tasks before `someday` tasks', () => {
      const tasks = [
        task({ someday: true }),
        task(),
      ];
      const picked = pickTasks(tasks, { limit: 1 });
      expect(picked[0].id).toBe(tasks[1].id);
    });
  });
});