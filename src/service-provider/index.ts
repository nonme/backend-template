import { getTaskService } from "./task.service.provider";
import { TaskService } from "../domain/tasks/task.service";
import { MongoTaskRepository } from "../infra/repositories/mongo-task.repository";
import * as NodeCache from "node-cache";

export const servicesByName = {
  task: getTaskService,
} as const;

type ServiceName = keyof typeof servicesByName;

type ServiceByServiceName<Name extends ServiceName> = Name extends "task"
  ? TaskService
  : never;

const serviceInstances = new NodeCache({
  stdTTL: 300,
  useClones: false,
  checkperiod: 60,
});

export interface AppContext {
  mongoTaskRepository: MongoTaskRepository;
}

const getCacheKey = (serviceName: ServiceName): string => serviceName;

export const getService = <Name extends ServiceName>(
  context: AppContext,
  serviceName: Name,
  skipCache: boolean = false,
): ServiceByServiceName<Name> => {
  if (skipCache) {
    const serviceFactory = servicesByName[serviceName];
    return serviceFactory(
      context.mongoTaskRepository,
    ) as ServiceByServiceName<Name>;
  }

  const cacheKey = getCacheKey(serviceName);
  const cachedService = serviceInstances.get(cacheKey);

  if (cachedService) {
    return cachedService as ServiceByServiceName<Name>;
  }

  const serviceFactory = servicesByName[serviceName];
  const service = serviceFactory(context.mongoTaskRepository);

  serviceInstances.set(cacheKey, service);

  return service as ServiceByServiceName<Name>;
};
