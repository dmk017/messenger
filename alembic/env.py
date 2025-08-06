from logging.config import fileConfig
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
import os
import sys
import asyncio

# Добавляем путь к проекту для импорта настроек
sys.path.append(os.getcwd())

from messenger.config import settings
from messenger.models import SQLModel

config = context.config
fileConfig(config.config_file_name)
target_metadata = SQLModel.metadata

def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        include_schemas=True,
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_async_engine(settings.database_url)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

if context.is_offline_mode():
    print("Cannot run migrations in offline mode with async")
    sys.exit(1)
else:
    asyncio.run(run_migrations_online())