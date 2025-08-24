import type { NextFunction, Request, Response } from 'express';
import {
  AlreadyHasActiveConnectionError,
  CannotAttachTreeChildrenEntityError,
  CannotConnectAlreadyConnectedError,
  CannotCreateEntityIdMapError,
  CannotDetermineEntityError,
  CannotExecuteNotConnectedError,
  CannotGetEntityManagerNotConnectedError,
  CircularRelationsError,
  ColumnTypeUndefinedError,
  ConnectionIsNotSetError,
  ConnectionNotFoundError,
  CustomRepositoryCannotInheritRepositoryError,
  CustomRepositoryDoesNotHaveEntityError,
  CustomRepositoryNotFoundError,
  DataTypeNotSupportedError,
  DriverOptionNotSetError,
  DriverPackageNotInstalledError,
  EntityMetadataNotFoundError,
  EntityNotFoundError,
  EntityPropertyNotFoundError,
  FindRelationsNotFoundError,
  ForbiddenTransactionModeOverrideError,
  InitializedRelationError,
  InsertValuesMissingError,
  LimitOnUpdateNotSupportedError,
  LockNotSupportedOnGivenDriverError,
  MetadataAlreadyExistsError,
  MetadataWithSuchNameAlreadyExistsError,
  MissingDeleteDateColumnError,
  MissingDriverError,
  MissingJoinColumnError,
  MissingJoinTableError,
  MissingPrimaryColumnError,
  MustBeEntityError,
  NoConnectionForRepositoryError,
  NoConnectionOptionError,
  NoNeedToReleaseEntityManagerError,
  NoVersionOrUpdateDateColumnError,
  OffsetWithoutLimitNotSupportedError,
  OptimisticLockCanNotBeUsedError,
  OptimisticLockVersionMismatchError,
  PersistedEntityNotFoundError,
  PessimisticLockTransactionRequiredError,
  PrimaryColumnCannotBeNullableError,
  QueryFailedError,
  QueryRunnerAlreadyReleasedError,
  QueryRunnerProviderAlreadyReleasedError,
  RepositoryNotTreeError,
  ReturningStatementNotSupportedError,
  SubjectRemovedAndUpdatedError,
  TransactionAlreadyStartedError,
  TransactionNotStartedError,
  TreeRepositoryNotSupportedError,
  TypeORMError,
  UpdateValuesMissingError,
  UsingJoinColumnIsNotAllowedError,
  UsingJoinColumnOnlyOnOneSideAllowedError,
  UsingJoinTableIsNotAllowedError,
  UsingJoinTableOnlyOnOneSideAllowedError
} from 'typeorm';

// (Optional) QuickBooks SDK errors may include extra metadata; no named import needed here.
import logger from './logger';

class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ErrorResponse;

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.log(err);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  console.log((err as any)?.errorResponse?.Fault);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  console.log((err as any)?.errorResponse?.Fault?.Error);
  logger.error(err);

  let code = 500;
  let message = err.message || 'Internal Server Error';

  // Custom error handling based on error type
  if (err instanceof ErrorResponse) {
    code = err.statusCode;
    message = err.message;
  } else if (err instanceof EntityMetadataNotFoundError) {
    code = 404;
    message = err.message;
  } else if (err instanceof EntityNotFoundError) {
    code = 404;
    message = 'Document not found or you do not have access to this document';
  } else if (err instanceof QueryFailedError) {
    code = 400;
    switch (err.driverError.number) {
      case 547:
        message = 'No registry found for relation';
        break;
      case 2627:
        message = `${err.driverError.message.split('.').slice(1, 4).join('.').trim()}.`.replace('dbo.', '');
        break;
      default:
        message = err.message;
    }
  } else if (err instanceof UpdateValuesMissingError) {
    code = 400;
    message = `Update values missing: ${err.message}`;
  } else if (
    err instanceof AlreadyHasActiveConnectionError ||
    err instanceof CannotConnectAlreadyConnectedError ||
    err instanceof ConnectionIsNotSetError ||
    err instanceof QueryRunnerAlreadyReleasedError ||
    err instanceof CannotExecuteNotConnectedError ||
    err instanceof CannotGetEntityManagerNotConnectedError ||
    err instanceof ConnectionNotFoundError
  ) {
    code = 500;
    message = `Database connection error: ${err.message}`;
  } else if (err instanceof LockNotSupportedOnGivenDriverError) {
    code = 400;
    message = `Lock not supported on the given driver: ${err.message}`;
  } else if (err instanceof CannotCreateEntityIdMapError) {
    code = 500;
    message = `Cannot create entity ID map: ${err.message}`;
  } else if (err instanceof MetadataAlreadyExistsError) {
    code = 400;
    message = `Metadata already exists: ${err.message}`;
  } else if (err instanceof CannotDetermineEntityError) {
    code = 400;
    message = `Cannot determine entity: ${err.message}`;
  } else if (err instanceof TreeRepositoryNotSupportedError) {
    code = 400;
    message = `Tree repository not supported: ${err.message}`;
  } else if (err instanceof CustomRepositoryNotFoundError) {
    code = 404;
    message = `Custom repository not found: ${err.message}`;
  } else if (err instanceof TransactionNotStartedError || err instanceof TransactionAlreadyStartedError) {
    code = 500;
    message = `Transaction error: ${err.message}`;
  } else if (err instanceof MustBeEntityError) {
    code = 400;
    message = `Must be an entity: ${err.message}`;
  } else if (err instanceof OptimisticLockVersionMismatchError || err instanceof OptimisticLockCanNotBeUsedError) {
    code = 409;
    message = `Optimistic lock error: ${err.message}`;
  } else if (err instanceof LimitOnUpdateNotSupportedError) {
    code = 400;
    message = `Limit on update not supported: ${err.message}`;
  } else if (err instanceof PrimaryColumnCannotBeNullableError) {
    code = 400;
    message = `Primary column cannot be nullable: ${err.message}`;
  } else if (err instanceof CustomRepositoryCannotInheritRepositoryError) {
    code = 400;
    message = `Custom repository cannot inherit repository: ${err.message}`;
  } else if (err instanceof QueryRunnerProviderAlreadyReleasedError) {
    code = 500;
    message = `Query runner provider already released: ${err.message}`;
  } else if (err instanceof CannotAttachTreeChildrenEntityError) {
    code = 400;
    message = `Cannot attach tree children entity: ${err.message}`;
  } else if (err instanceof CustomRepositoryDoesNotHaveEntityError) {
    code = 400;
    message = `Custom repository does not have entity: ${err.message}`;
  } else if (err instanceof MissingDeleteDateColumnError) {
    code = 400;
    message = `Missing delete date column: ${err.message}`;
  } else if (err instanceof NoConnectionForRepositoryError) {
    code = 500;
    message = `No connection for repository: ${err.message}`;
  } else if (err instanceof CircularRelationsError) {
    code = 400;
    message = `Circular relations error: ${err.message}`;
  } else if (err instanceof ReturningStatementNotSupportedError) {
    code = 400;
    message = `Returning statement not supported: ${err.message}`;
  } else if (
    err instanceof UsingJoinTableIsNotAllowedError ||
    err instanceof UsingJoinColumnIsNotAllowedError ||
    err instanceof UsingJoinTableOnlyOnOneSideAllowedError ||
    err instanceof UsingJoinColumnOnlyOnOneSideAllowedError
  ) {
    code = 400;
    message = `Join table/column error: ${err.message}`;
  } else if (err instanceof MissingJoinColumnError) {
    code = 400;
    message = `Missing join column: ${err.message}`;
  } else if (err instanceof MissingPrimaryColumnError) {
    code = 400;
    message = `Missing primary column: ${err.message}`;
  } else if (err instanceof EntityPropertyNotFoundError) {
    code = 400;
    message = `Entity property not found: ${err.message}`;
  } else if (err instanceof MissingDriverError) {
    code = 500;
    message = `Missing driver: ${err.message}`;
  } else if (err instanceof DriverPackageNotInstalledError) {
    code = 500;
    message = `Driver package not installed: ${err.message}`;
  } else if (err instanceof NoVersionOrUpdateDateColumnError) {
    code = 400;
    message = `No version or update date column: ${err.message}`;
  } else if (err instanceof InsertValuesMissingError) {
    code = 400;
    message = `Insert values missing: ${err.message}`;
  } else if (err instanceof MetadataWithSuchNameAlreadyExistsError) {
    code = 400;
    message = `Metadata with such name already exists: ${err.message}`;
  } else if (err instanceof DriverOptionNotSetError) {
    code = 400;
    message = `Driver option not set: ${err.message}`;
  } else if (err instanceof FindRelationsNotFoundError) {
    code = 404;
    message = `Find relations not found: ${err.message}`;
  } else if (err instanceof PessimisticLockTransactionRequiredError) {
    code = 400;
    message = `Pessimistic lock transaction required: ${err.message}`;
  } else if (err instanceof RepositoryNotTreeError) {
    code = 400;
    message = `Repository not tree: ${err.message}`;
  } else if (err instanceof DataTypeNotSupportedError) {
    code = 400;
    message = `Data type not supported: ${err.message}`;
  } else if (err instanceof InitializedRelationError) {
    code = 400;
    message = `Initialized relation error: ${err.message}`;
  } else if (err instanceof MissingJoinTableError) {
    code = 400;
    message = `Missing join table: ${err.message}`;
  } else if (err instanceof NoNeedToReleaseEntityManagerError) {
    code = 400;
    message = `No need to release entity manager: ${err.message}`;
  } else if (err instanceof SubjectRemovedAndUpdatedError) {
    code = 400;
    message = `Subject removed and updated error: ${err.message}`;
  } else if (err instanceof PersistedEntityNotFoundError) {
    code = 404;
    message = `Persisted entity not found: ${err.message}`;
  } else if (err instanceof ColumnTypeUndefinedError) {
    code = 400;
    message = `Column type undefined: ${err.message}`;
  } else if (err instanceof OffsetWithoutLimitNotSupportedError) {
    code = 400;
    message = `Offset without limit not supported: ${err.message}`;
  } else if (err instanceof NoConnectionOptionError) {
    code = 500;
    message = `No connection option: ${err.message}`;
  } else if (err instanceof ForbiddenTransactionModeOverrideError) {
    code = 400;
    message = `Forbidden transaction mode override: ${err.message}`;
  } else if (err instanceof TypeORMError) {
    code = 500;
    message = `TypeORM error: ${err.message}`;
  }

  res.status(code).json({
    success: false,
    error: message
  });
};
