import core from '@actions/core'
import github from '@actions/github'

async function run(): Promise<void> {
  try {
    const pullRequest = github.context.payload.pull_request
    // const client = github.getOctokit(core.getInput('token'))
    console.log('client')

    // if (pullRequest) {
    //   const owner = pullRequest.base.user.login
    //   const repo = pullRequest.base.repo.name
    //   const pullRequestNumber = pullRequest.number
    //   const pullRequestDetails = await client.rest.pulls.get({
    //     owner,
    //     repo,
    //     pull_number: pullRequestNumber
    //   })

    //   const titleRegex = core.getInput('title-regex')
    //   const title = pullRequestDetails.data.title
    //   const isPRTitleValid = validatePRField({field: title, regex: titleRegex})

    //   const descriptionRegex = core.getInput('description-regex')
    //   const description = pullRequestDetails.data.body ?? ''
    //   const isPRDescriptionValid = validatePRField({
    //     field: description,
    //     regex: descriptionRegex
    //   })

    //   if (!isPRTitleValid || !isPRDescriptionValid) {
    //     !isPRTitleValid &&
    //       (await client.rest.issues.createComment({
    //         owner,
    //         repo,
    //         issue_number: pullRequestNumber,
    //         body: `The format of the PR title is invalid`
    //       }))

    //     !isPRDescriptionValid &&
    //       (await client.rest.issues.createComment({
    //         owner,
    //         repo,
    //         issue_number: pullRequestNumber,
    //         body: `The format of the PR description is invalid`
    //       }))

    //     throw new Error('PR is invalid')
    //   }

    //   await client.rest.issues.createLabel({
    //     owner,
    //     repo,
    //     name: 'Ready for Review',
    //     description: 'The PR is ready to review',
    //     color: '#00FF00'
    //   })
    // }
  } catch (error) {
    core.setFailed(getErrorMessage(error))
  }
}

function validatePRField(data: {field: string; regex: string}): boolean {
  const {field, regex} = data
  const regExp = new RegExp(regex, 'gm')
  const isFieldValid = regExp.test(field)

  return isFieldValid
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

run()
