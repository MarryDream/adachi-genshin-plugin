import { scheduleJob, Job, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit, JobCallback } from "node-schedule";

type Rule = RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string | number;

class ScheduleHub {
	private anonymizeKey = Symbol.for( "anonymize" );
	private jobMap = new Map<string | Symbol, Job[]>();

	public on( name: string | Symbol, rule: Rule, callback: JobCallback ): Job;
	public on( rule: Rule, callback: JobCallback ): Job;
	public on( nameOrRule: string | Symbol | Rule = this.anonymizeKey, ruleOrCallback: Rule | JobCallback, callback?: JobCallback ): Job {
		let name: string | Symbol, job: Job;

		if ( callback ) {
			name = <string | Symbol>nameOrRule;
			job = scheduleJob( <string>nameOrRule, <Rule>ruleOrCallback, callback );
		} else {
			name = this.anonymizeKey;
			job = scheduleJob( <Rule>nameOrRule, <JobCallback>ruleOrCallback );
		}

		const jobList = this.jobMap.get( name );

		if ( jobList ) {
			jobList.push( job );
		} else {
			this.jobMap.set( name, [ job ] );
		}

		return job;
	}

	public delete( job: Job, reschedule?: boolean ) {
		const type = /<Anonymous\sJob\s\d.+?\s.+?>/.test( Job.name ) ? this.anonymizeKey : job.name;
		const jobList = this.jobMap.get( type ) || [];
		const jobIndex = jobList.indexOf( job );
		if ( jobIndex !== -1 ) {
			jobList.splice( jobIndex, 1 );
		}
		job.cancel( reschedule );
	}

	public clear( type?: string | string[] ) {
		if ( type ) {
			const types = typeof type === "string" ? [ type ] : type;
			types.forEach( t => {
				const jobs = this.jobMap.get( t );
				if ( !jobs ) {
					return;
				}
				jobs.forEach( job => job.cancel() );
				this.jobMap.delete( t );
			} )
		} else {
			this.jobMap.forEach( jobs => {
				jobs.forEach( job => job.cancel() );
			} )
			this.jobMap.clear();
		}
	}
}

export const scheduleHub = new ScheduleHub();