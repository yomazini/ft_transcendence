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
    SCRAPING = 'Scraping'


class Paymentstatus(str, enum.Enum):
    PENDING = 'Pending'
    SUCCEEDED = 'Succeeded'
    FAILED = 'Failed'


class Plantier(str, enum.Enum):
    FREE = 'Free'
    PREMIUM = 'Premium'
    EXTRA = 'Extra'


class Roles(str, enum.Enum):
    ADMIN = 'Admin'
    ANALYST = 'Analyst'
    VIEWER = 'Viewer'


class Subscriptionstatus(str, enum.Enum):
    ACTIVE = 'Active'
    CANCELED = 'Canceled'
    EXPIRED = 'Expired'


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

    ApiKey: Mapped[list['ApiKey']] = relationship('ApiKey', back_populates='org')
    Job: Mapped[list['Job']] = relationship('Job', back_populates='org')
    Subscription: Mapped[list['Subscription']] = relationship('Subscription', back_populates='org')
    role_and_organization: Mapped[list['RoleAndOrganization']] = relationship('RoleAndOrganization', back_populates='org')
    Payment: Mapped[list['Payment']] = relationship('Payment', back_populates='org')


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
    is_2fa_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    two_factor_secret: Mapped[Optional[str]] = mapped_column(Text)

    ApiKey: Mapped[list['ApiKey']] = relationship('ApiKey', back_populates='user')
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


class ApiKey(Base):
    __tablename__ = 'ApiKey'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='ApiKey_org_id_fkey'),
        ForeignKeyConstraint(['user_id'], ['User.id'], ondelete='CASCADE', onupdate='CASCADE', name='ApiKey_user_id_fkey'),
        PrimaryKeyConstraint('id', name='ApiKey_pkey'),
        Index('ApiKey_key_hash_key', 'key_hash', unique=True),
        Index('ApiKey_org_id_active_idx', 'org_id', 'active'),
        Index('ApiKey_org_id_key', 'org_id', unique=True),
        Index('ApiKey_user_id_key', 'user_id', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    user_id: Mapped[str] = mapped_column(Text, nullable=False)
    key_hash: Mapped[str] = mapped_column(Text, nullable=False)
    prefix: Mapped[str] = mapped_column(Text, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('true'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    label: Mapped[Optional[str]] = mapped_column(Text)
    last_used_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(precision=3))
    revoked_at: Mapped[Optional[datetime.datetime]] = mapped_column(TIMESTAMP(precision=3))

    org: Mapped['Organization'] = relationship('Organization', back_populates='ApiKey')
    user: Mapped['User'] = relationship('User', back_populates='ApiKey')


class Job(Base):
    __tablename__ = 'Job'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='Job_org_id_fkey'),
        PrimaryKeyConstraint('id', name='Job_pkey')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    target: Mapped[str] = mapped_column(Text, nullable=False)
    mode: Mapped[Jobmodes] = mapped_column(Enum(Jobmodes, values_callable=lambda cls: [member.value for member in cls], name='JobModes'), nullable=False, server_default=text('\'Keyword\'::"JobModes"'))
    status: Mapped[Jobstatuses] = mapped_column(Enum(Jobstatuses, values_callable=lambda cls: [member.value for member in cls], name='JobStatuses'), nullable=False, server_default=text('\'Queued\'::"JobStatuses"'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    customer_persona: Mapped[Optional[object]] = mapped_column(JSONB)

    org: Mapped['Organization'] = relationship('Organization', back_populates='Job')
    Comments: Mapped[list['Comments']] = relationship('Comments', back_populates='job')
    Report: Mapped[list['Report']] = relationship('Report', back_populates='job')
    SubJob: Mapped[list['SubJob']] = relationship('SubJob', back_populates='job')


class Subscription(Base):
    __tablename__ = 'Subscription'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='Subscription_org_id_fkey'),
        PrimaryKeyConstraint('id', name='Subscription_pkey'),
        Index('Subscription_ends_at_idx', 'ends_at'),
        Index('Subscription_org_id_status_idx', 'org_id', 'status')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    plan: Mapped[Plantier] = mapped_column(Enum(Plantier, values_callable=lambda cls: [member.value for member in cls], name='PlanTier'), nullable=False)
    status: Mapped[Subscriptionstatus] = mapped_column(Enum(Subscriptionstatus, values_callable=lambda cls: [member.value for member in cls], name='SubscriptionStatus'), nullable=False, server_default=text('\'Active\'::"SubscriptionStatus"'))
    started_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    ends_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False)
    cancel_at_period_end: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text('false'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))

    org: Mapped['Organization'] = relationship('Organization', back_populates='Subscription')
    Payment: Mapped[list['Payment']] = relationship('Payment', back_populates='subscription')


class RoleAndOrganization(Base):
    __tablename__ = 'role_and_organization'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='role_and_organization_org_id_fkey'),
        ForeignKeyConstraint(['user_id'], ['User.id'], ondelete='CASCADE', onupdate='CASCADE', name='role_and_organization_user_id_fkey'),
        PrimaryKeyConstraint('id', name='role_and_organization_pkey'),
        Index('role_and_organization_user_id_key', 'user_id', unique=True),
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
        ForeignKeyConstraint(['parent_id'], ['Comments.id'], ondelete='SET NULL', onupdate='CASCADE', name='Comments_parent_id_fkey'),
        PrimaryKeyConstraint('id', name='Comments_pkey')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    job_id: Mapped[str] = mapped_column(Text, nullable=False)
    text_: Mapped[str] = mapped_column('text', Text, nullable=False)
    upvotes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    hash: Mapped[str] = mapped_column(String(64), nullable=False)
    reddit_id: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    author: Mapped[Optional[str]] = mapped_column(Text)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Double(53))
    embedding: Mapped[Optional[object]] = mapped_column(VECTOR)
    parent_id: Mapped[Optional[str]] = mapped_column(Text)

    job: Mapped['Job'] = relationship('Job', back_populates='Comments')
    parent: Mapped[Optional['Comments']] = relationship('Comments', remote_side=[id], back_populates='parent_reverse')
    parent_reverse: Mapped[list['Comments']] = relationship('Comments', remote_side=[parent_id], back_populates='parent')


class Payment(Base):
    __tablename__ = 'Payment'
    __table_args__ = (
        ForeignKeyConstraint(['org_id'], ['Organization.id'], ondelete='CASCADE', onupdate='CASCADE', name='Payment_org_id_fkey'),
        ForeignKeyConstraint(['subscription_id'], ['Subscription.id'], ondelete='SET NULL', onupdate='CASCADE', name='Payment_subscription_id_fkey'),
        PrimaryKeyConstraint('id', name='Payment_pkey'),
        Index('Payment_idempotency_key_key', 'idempotency_key', unique=True),
        Index('Payment_org_id_created_at_idx', 'org_id', 'created_at'),
        Index('Payment_provider_reference_key', 'provider_reference', unique=True),
        Index('Payment_subscription_id_idx', 'subscription_id')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    org_id: Mapped[str] = mapped_column(Text, nullable=False)
    plan: Mapped[Plantier] = mapped_column(Enum(Plantier, values_callable=lambda cls: [member.value for member in cls], name='PlanTier'), nullable=False)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("'USD'::text"))
    status: Mapped[Paymentstatus] = mapped_column(Enum(Paymentstatus, values_callable=lambda cls: [member.value for member in cls], name='PaymentStatus'), nullable=False, server_default=text('\'Pending\'::"PaymentStatus"'))
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    updated_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False)
    subscription_id: Mapped[Optional[str]] = mapped_column(Text)
    idempotency_key: Mapped[Optional[str]] = mapped_column(Text)
    provider_reference: Mapped[Optional[str]] = mapped_column(Text)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text)

    org: Mapped['Organization'] = relationship('Organization', back_populates='Payment')
    subscription: Mapped[Optional['Subscription']] = relationship('Subscription', back_populates='Payment')


class Report(Base):
    __tablename__ = 'Report'
    __table_args__ = (
        ForeignKeyConstraint(['job_id'], ['Job.id'], ondelete='CASCADE', onupdate='CASCADE', name='Report_job_id_fkey'),
        PrimaryKeyConstraint('id', name='Report_pkey')
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    job_id: Mapped[str] = mapped_column(Text, nullable=False)
    swot: Mapped[object] = mapped_column(JSONB, nullable=False)
    blue_ocean: Mapped[object] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    conclusion: Mapped[Optional[str]] = mapped_column(Text)
    sentiment_score: Mapped[Optional[float]] = mapped_column(Double(53))

    job: Mapped['Job'] = relationship('Job', back_populates='Report')


class SubJob(Base):
    __tablename__ = 'SubJob'
    __table_args__ = (
        ForeignKeyConstraint(['job_id'], ['Job.id'], ondelete='CASCADE', onupdate='CASCADE', name='SubJob_job_id_fkey'),
        PrimaryKeyConstraint('id', name='SubJob_pkey'),
        Index('SubJob_next_id_key', 'next_id', unique=True)
    )

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    job_id: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP(precision=3), nullable=False, server_default=text('CURRENT_TIMESTAMP'))
    data: Mapped[Optional[object]] = mapped_column(JSONB)
    next_id: Mapped[Optional[str]] = mapped_column(Text)

    job: Mapped['Job'] = relationship('Job', back_populates='SubJob')
