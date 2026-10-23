from typing import Optional
import datetime
import enum

from pgvector.sqlalchemy.vector import VECTOR
from sqlalchemy import Boolean, DateTime, Double, Enum, ForeignKeyConstraint, Index, Integer, PrimaryKeyConstraint, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Backupstatus(str, enum.Enum):
    IN_PROGRESS = 'IN_PROGRESS'
    SUCCESS = 'SUCCESS'
    FAILED = 'FAILED'
    RESTORED = 'RESTORED'


class Jobmodes(str, enum.Enum):
    KEYWORD = 'Keyword'
    SUBREDDIT = 'Subreddit'
    POST = 'Post'
    USER = 'User'


class Jobstatuses(str, enum.Enum):
    QUEUED = 'Queued'
    RUNNING = 'Running'
    DONE = 'Done'
    FAILED = 'Failed'


class Roles(str, enum.Enum):
    ADMIN = 'Admin'
    ANALYST = 'Analyst'
    VIEWER = 'Viewer'


class Backups(Base):
    __tablename__ = 'Backups'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='Backups_pkey'),
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    fileName: Mapped[str] = mapped_column(Text, nullable=False)
    filePath: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[Backupstatus] = mapped_column(Enum(Backupstatus, values_callable=lambda cls: [member.value for member in cls], name='BackupStatus'), nullable=False, server_default=text('\'IN_PROGRESS\'::"BackupStatus"'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    s3Key: Mapped[Optional[str]] = mapped_column(Text)
    fileSize: Mapped[Optional[int]] = mapped_column(Integer)
    errorMessage: Mapped[Optional[str]] = mapped_column(Text)


class Organization(Base):
    __tablename__ = 'Organization'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='Organization_pkey'),
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))

    Job: Mapped[list['Job']] = relationship('Job', back_populates='org')
    Messages: Mapped[list['Messages']] = relationship('Messages', back_populates='org')
    role_and_organization: Mapped[list['RoleAndOrganization']] = relationship('RoleAndOrganization', back_populates='org')


class User(Base):
    __tablename__ = 'User'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='User_pkey'),
        Index('User_email_key', 'email', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    password: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    is_2fa_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    two_factor_secret: Mapped[Optional[str]] = mapped_column(Text)

    Job: Mapped[list['Job']] = relationship('Job', back_populates='User_')
    Messages: Mapped[list['Messages']] = relationship('Messages', back_populates='user')
    role_and_organization: Mapped[list['RoleAndOrganization']] = relationship('RoleAndOrganization', back_populates='user')


class PrismaMigrations(Base):
    __tablename__ = '_prisma_migrations'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='_prisma_migrations_pkey'),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    migration_name: Mapped[str] = mapped_column(String(255), nullable=False)
    started_at: Mapped[datetime.datetime] = mapped_column(DateTime(True), nullable=False, server_default=text('now()'))
    applied_steps_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text('0'))
    finished_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))
    logs: Mapped[Optional[str]] = mapped_column(Text)
    rolled_back_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(True))


class Job(Base):
    __tablename__ = 'Job'
    __table_args__ = (
        ForeignKeyConstraint(['created_by'], ['User.id'], ondelete='SET NULL', onupdate='CASCADE', name='Job_created_by_fkey'),
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='Job_org_id_fkey'),
        PrimaryKeyConstraint('id', name='Job_pkey')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    target: Mapped[str] = mapped_column(Text, nullable=False)
    mode: Mapped[Jobmodes] = mapped_column(Enum(Jobmodes, values_callable=lambda cls: [member.value for member in cls], name='JobModes'), nullable=False, server_default=text('\'Keyword\'::"JobModes"'))
    status: Mapped[Jobstatuses] = mapped_column(Enum(Jobstatuses, values_callable=lambda cls: [member.value for member in cls], name='JobStatuses'), nullable=False, server_default=text('\'Running\'::"JobStatuses"'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    created_by: Mapped[Optional[str]] = mapped_column(Text)
    customer_persona: Mapped[Optional[object]] = mapped_column(JSONB)

    User_: Mapped[Optional['User']] = relationship('User', back_populates='Job')
    org: Mapped['Organization'] = relationship('Organization', back_populates='Job')
    Comments: Mapped[list['Comments']] = relationship('Comments', back_populates='job')
    Report: Mapped[list['Report']] = relationship('Report', back_populates='job')


class Messages(Base):
    __tablename__ = 'Messages'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='Messages_org_id_fkey'),
        ForeignKeyConstraint(['user_id'], ['User.id'], ondelete='CASCADE', onupdate='CASCADE', name='Messages_user_id_fkey'),
        PrimaryKeyConstraint('id', name='Messages_pkey')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    user_id: Mapped[str] = mapped_column(Text, nullable=False)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    text_: Mapped[str] = mapped_column('text', Text, nullable=False)
    read_status: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))

    org: Mapped['Organization'] = relationship('Organization', back_populates='Messages')
    user: Mapped['User'] = relationship('User', back_populates='Messages')


class RoleAndOrganization(Base):
    __tablename__ = 'role_and_organization'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='role_and_organization_org_id_fkey'),
        ForeignKeyConstraint(['user_id'], ['User.id'], ondelete='CASCADE', onupdate='CASCADE', name='role_and_organization_user_id_fkey'),
        PrimaryKeyConstraint('id', name='role_and_organization_pkey'),
        Index('role_and_organization_user_id_org_id_key', 'user_id', 'org_id', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    user_id: Mapped[str] = mapped_column(Text, nullable=False)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[Roles] = mapped_column(Enum(Roles, values_callable=lambda cls: [member.value for member in cls], name='Roles'), nullable=False, server_default=text('\'Viewer\'::"Roles"'))

    org: Mapped['Organization'] = relationship('Organization', back_populates='role_and_organization')
    user: Mapped['User'] = relationship('User', back_populates='role_and_organization')


class Comments(Base):
    __tablename__ = 'Comments'
    __table_args__ = (
        ForeignKeyConstraint(['job_id'], ['Job.id'], ondelete='CASCADE', onupdate='CASCADE', name='Comments_job_id_fkey'),
        PrimaryKeyConstraint('id', name='Comments_pkey')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    job_id: Mapped[str] = mapped_column(Text, nullable=False)
    text_: Mapped[str] = mapped_column('text', Text, nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    author: Mapped[Optional[str]] = mapped_column(Text)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Double(53))
    embedding: Mapped[Optional[object]] = mapped_column(VECTOR)

    job: Mapped['Job'] = relationship('Job', back_populates='Comments')


class Report(Base):
    __tablename__ = 'Report'
    __table_args__ = (
        ForeignKeyConstraint(['job_id'], ['Job.id'], ondelete='CASCADE', onupdate='CASCADE', name='Report_job_id_fkey'),
        PrimaryKeyConstraint('id', name='Report_pkey'),
        Index('Report_job_id_key', 'job_id', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    job_id: Mapped[str] = mapped_column(Text, nullable=False)
    swot: Mapped[object] = mapped_column(JSONB, nullable=False)
    blue_ocean: Mapped[object] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    conclusion: Mapped[Optional[str]] = mapped_column(Text)

    job: Mapped['Job'] = relationship('Job', back_populates='Report')
