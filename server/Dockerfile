FROM public.ecr.aws/lambda/nodejs:20

COPY package*.json ${LAMBDA_TASK_ROOT}/

RUN npm ci --only=production

COPY . ${LAMBDA_TASK_ROOT}/

EXPOSE 5000

CMD [ "index.handler" ]
