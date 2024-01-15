terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket = "property-praxis-terraform-state"
    key    = "github/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

locals {
  name            = "property-praxis"
  state_bucket    = "property-praxis-terraform-state"
  github_subjects = ["PropertyPraxis/property-praxis:*"]

  tags = {
    project = local.name
  }
}

# Use OIDC across multiple environments
module "iam_github_oidc_provider" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"
  version = "5.30.0"
}

resource "aws_iam_policy" "update_access" {
  name = "${local.name}-update-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["s3:*"]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::${local.state_bucket}",
          "arn:aws:s3:::${local.state_bucket}/*"
        ]
      },
      {
        Action = [
          "ecs:*"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:cluster:${local.name}*",
          "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:cluster:${local.name}*:*",
          "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:service/${local.name}*",
          "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:service/${local.name}*:*"
        ]
      },
      {
        Action   = ["ecs:RegisterTaskDefinition", "ecs:DeregisterTaskDefinition"],
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:*"
        ]
        Effect = "Allow"
        Resource = [
          "arn:aws:s3:::${local.name}*",
          "arn:aws:s3:::${local.name}*/*"
        ]
      },
    ]
  })

  tags = local.tags
}

resource "aws_iam_policy" "read_access" {
  name = "${local.name}-read-access"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:CompleteLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:InitiateLayerUpload",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:SetRepositoryPolicy"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action   = ["ssm:Get*"],
        Effect   = "Allow",
        Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${local.name}/*"
      },
      {
        Action   = ["iam:PassRole"],
        Effect   = "Allow",
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.name}*"
      },
      {
        Action = [
          "iam:Get*",
          "iam:List*",
          "logs:List*",
          "logs:Describe*",
          "ecr:Get*",
          "ecr:List*",
          "ecr:Describe*",
          "s3:Get*",
          "s3:List*",
          "events:Get*",
          "events:List*",
          "events:Describe*",
          "ec2:Describe*",
          "elasticloadbalancing:Describe*",
          "elasticloadbalancing:List*",
          "application-autoscaling:Describe*",
          "application-autoscaling:List*",
          "ecs:Describe*",
          "rds:Describe*",
          "rds:List*",
          "apigateway:GET",
          "route53:Get*",
          "route53:Describe*",
          "route53:List*",
          "acm:Get*",
          "acm:Describe*",
          "acm:List*",
          "cloudfront:Get*",
          "cloudfront:Describe*",
          "cloudfront:List*",
          "secretsmanager:Get*",
          "secretsmanager:Describe*"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })

  tags = local.tags
}

module "iam_github_oidc_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"
  version = "5.30.0"

  name     = "${local.name}-terraform-github-role"
  subjects = local.github_subjects

  policies = {
    UpdateAccess = aws_iam_policy.update_access.arn
    ReadAccess   = aws_iam_policy.read_access.arn
  }

  tags = local.tags
}
